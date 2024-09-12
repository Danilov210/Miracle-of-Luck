import { auth } from 'express-oauth2-jwt-bearer'
const app = express();
import express from 'express';


const jwtCheck = auth({
    audience: 'http://localhost:8000',
    issuerBaseURL: 'https://dev-0xrld0sjyuhye82d.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});

export default jwtCheck

// enforce on all endpoints
app.use(jwtCheck);

app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});



