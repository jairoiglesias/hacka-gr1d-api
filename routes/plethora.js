let express = require('express');
let router = express.Router();
let rp = require('request-promise');

const {
    PLETHORA_API_KEY,
} = process.env


router.get('/contract_plethora_pet/:id', async (req, res) => {

    try{
  
      let id = req.params.id
  
      var options = {
        method: 'POST',
        // uri: 'https://gateway.gr1d.io/sandbox/solutionsone/petstandard/v1/Policies/'+id+'/activations',
        uri: 'https://gateway.gr1d.io/sandbox/solutionsone/petstandard/v1/Policies/3fa85f64-5717-4562-b3fc-2c963f66afa6/activations',
        headers: {
          'X-Api-Key': PLETHORA_API_KEY
        },
        body: {
            "ServiceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "Individuals": [
              {
                "Name": "string",
                "Type": "Holder",
                "Document": "string",
                "DocumentType": "string",
                "BirthDate": "2019-09-15T14:07:35.888Z",
                "Gender": "M",
                "Contacts": [
                  {
                    "Name": "string",
                    "Type": "Email",
                    "Value": "string"
                  }
                ],
                "Addresses": [
                  {
                    "Type": "Home",
                    "Line1": "string",
                    "Line2": "string",
                    "City": "string",
                    "PostalCode": "string",
                    "SubDivisionCode": "string",
                    "CountryCode": "string"
                  }
                ],
                "OtherFields": [
                  {
                    "additionalProp1": "string",
                    "additionalProp2": "string",
                    "additionalProp3": "string"
                  }
                ]
              }
            ]
          },
        timeout: 15000,
        json: true
      };
  
      let result = await rp(options)

      res.status(200).send(result)

    }
    catch(e){
  
      console.log('ERRO')
      console.log(e)
  
      res.status(500).send({
        error: e
      })
  
    }
  
  })

  module.exports = router;