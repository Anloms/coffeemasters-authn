import express from 'express'
import { Low } from 'lowdb'//open source library for node that brights the content of json files; which is easy for debugging, we can see whether the content is stored or not
import { JSONFile } from 'lowdb/node'
import * as url from 'url';
import bcrypt from 'bcryptjs';
import * as jwtJsDecode from 'jwt-js-decode';
import base64url from "base64url";
import SimpleWebAuthnServer from '@simplewebauthn/server';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express()
app.use(express.json())

const adapter = new JSONFile(__dirname + '/auth.json');
const db = new Low(adapter);
await db.read();
db.data ||= { users: [] }

const rpID = "localhost";
const protocol = "http";
const port = 5050;
const expectedOrigin = `${protocol}://${rpID}:${port}`;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

function findUser(email) {
  const results = db.data.users.filter(x=>x.email == email);
  if(results.length===0) return undefined;
  return results[0];
}

// ADD HERE THE REST OF THE ENDPOINTS
app.post("/auth/register", (req,res) => {
  //TODO: to make the code production ready: Data Validation
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }
  const userFound = findUser(user.email);
  if(userFound ) {
    res.status(404).send({ok:false, message: "user already exists"})
  } else{
    db.data.users.push(user);
    db.write();
    res.status(200).json(user)
  }
})


app.get("*", (req, res) => {
    res.sendFile(__dirname + "public/index.html"); 
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

