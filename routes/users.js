const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const router = express.Router();
router.use(bodyParser.json());
// Function to generate a UUID
async function generateUUID() {
  const response = await axios.get("https://www.uuidgenerator.net/api/version4");
  return response.data;
}

// Function to create an API user
async function createAPIUser(uuid) {
  const requestData = JSON.stringify({ providerCallbackHost: "string" });
  const config = {
    method: "post",
    url: "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser",
    headers: {
      "X-Reference-Id": uuid,
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": "89b34d5304d443d3ba0b2f81d72904f9",
    },
    data: requestData,
  };
  const response = await axios.request(config);
  console.log(response);
  
  return response;
}

// Function to get an API key
async function getAPIKey(uuid) {
  const config = {
    method: "post",
    url: `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${uuid}/apikey`,
    headers: {
      "Ocp-Apim-Subscription-Key": "89b34d5304d443d3ba0b2f81d72904f9",
    },
  };
  const response = await axios.request(config);
  return response.data.apiKey;
}

// Function to get an access token
async function getAccessToken(uuid, apiKey) {
  const auth = Buffer.from(`${uuid}:${apiKey}`).toString("base64");
  const config = {
    method: "post",
    url: "https://sandbox.momodeveloper.mtn.com/collection/token/",
    headers: {
      Authorization: `Basic ${auth}`,
      "Ocp-Apim-Subscription-Key": "89b34d5304d443d3ba0b2f81d72904f9",
    },
  };
  const response = await axios.request(config);
  return response.data.access_token;
}

// Function to initiate a payment request
async function initiatePayment(uuid, accessToken,paymentInfo) {
  console.log(paymentInfo);
  const requestData = JSON.stringify({
    amount: "1000",
    currency: "EUR",
    externalId: "46733123450",
    payer: {
      partyIdType: "MSISDN",
      partyId: "46733123450",
    },
    payerMessage: "please Pay",
    payeeNote: "confirm the payment bro",
  });

  const config = {
    method: "post",
    url: "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Reference-Id": uuid,
      "X-Target-Environment": "sandbox",
      "Ocp-Apim-Subscription-Key": "89b34d5304d443d3ba0b2f81d72904f9",
      "Content-Type": "application/json",
    },
    data: requestData,
  };

  const response = await axios.request(config);
  return response.statusText;
}

// Express route to initiate the process
router.route("/").post(async (req, res) => {
    // console.log(req.body);
  try {
    const uuid = await generateUUID();
    const apiUserResponse = await createAPIUser(uuid);

    if (apiUserResponse.status === 201) {
      console.log(apiUserResponse.status);
      
      const apiKey = await getAPIKey(uuid);
      console.log(apiKey);

      const accessToken = await getAccessToken(uuid, apiKey);
      console.log(accessToken);

      const paymentStatus = await initiatePayment(uuid, accessToken,req.body);
      console.log(paymentStatus);
      
      res.send(paymentStatus);
    } else {
      res.status(apiUserResponse.status).send(apiUserResponse.statusText);
    }
  } catch (error) {
    console.error(`{${error} someting wrongeee}`);
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
