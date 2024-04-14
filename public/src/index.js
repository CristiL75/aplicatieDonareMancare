const session = require("express-session");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const { AutentificareCollection} = require("C:\\Users\\OWNER\\Desktop\\aplicatiereciclare\\public\\src\\mongo.js");

const app = express();
const PORT = 5000;


const axios = require('axios');

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("views"));

const jwt = require('jsonwebtoken');


function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        userType: user.userType
    };
    const options = {
        expiresIn: '10d' 
    };
    return jwt.sign(payload, 'secret-key', options);
}

app.get("/", (req, res) => {
    res.render("autentificare");
});



app.get("/inregistrare", (req, res) => {
    res.render("inregistrare");
});


app.post("/inregistrare", async (req, res) => {
    const data = {
        email: req.body.email,
        name: req.body.username,
        userType:req.body.userType,
        password: req.body.password
    };

    console.log("Am primit datele:", data);

    try {
        if (!data.email || !data.name || !data.password) {
            return res.status(400).send("Missing required fields");
        }

        const existingUser = await AutentificareCollection.findOne({ name: data.name });

        if (existingUser) {
            return res.send("Username deja folosit");
        } else {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;

            const newUser = await AutentificareCollection.create(data);
            console.log("User data inserted:", newUser);
            const token = generateToken(newUser);

            return res.redirect("/");
        }
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).send("Error registering user");
    }
});


app.get("/", (req, res) => {
    res.render("/autentificare"); 
})

app.post("/autentificare", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userData = await AutentificareCollection.findOne({ email });
        console.log("User Data:", userData);
        if (!userData) {
            return res.send("Username-ul nu este gasit");
        }
        
        const isPasswordMatch = await bcrypt.compare(password, userData.password);
        if (isPasswordMatch) { 
            req.session.username = userData.name;
            req.session.userType = userData.userType;
            const token = generateToken(userData);
            if(userData.userType === 'beneficiar'){
                res.redirect("/acasaBeneficiar?token="+token);
            }
            else if(userData.userType === 'donator'){
                res.redirect("/acasaDonator?token="+token);
            }
            else{
                res.send("Mai incearca!");
            }
        } else {
            return res.send("Wrong password");
        }
    } catch (error) {
        console.error(error);
        return res.send("Eroare la autentificare");
    }
});

app.get("/acasaBeneficiar", (req, res) => {
    const userType = req.session.userType;
    res.render("acasaBeneficiar", { token: req.query.token, userType: userType }); // Trimite userType către pagina acasaDonator
});


app.get("/acasaDonator", (req, res) => {
    const userType = req.session.userType; // Accesează userType din sesiune
    if (!userType) {
        return res.send("UserType lipsesc în sesiune");
    }
    res.render("acasaDonator", { token: req.query.token, userType: userType }); // Trimite userType către pagina acasaDonator
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});
