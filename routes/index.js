let express = require('express');
let router = express.Router();
let rp = require('request-promise');
const Nexmo = require('nexmo');

const INFOCAR_API_KEY_PARECER_TECNICO = '2c6928e2-d39f-448b-a7b1-c40065e50e3e'
const INFOCAR_API_KEY_DEBITO_RESTRICAO = 'bff94978-c27d-4761-a311-5fe0c2cd14d9'
const MONGERAL_API_KEY = '3cd346aa-a061-4242-b249-08985f4ce862'

const NEXMO_API_KEY = '5e1dd1c4'
const NEXMO_API_SECRET = 'uhRVPleomo7rAzI3'

let clientDemands = []

async function sendSMS(phoneNumber, message){

  return new Promise((resolve, reject) => {

    const nexmo = new Nexmo({
      apiKey: NEXMO_API_KEY,
      apiSecret: NEXMO_API_SECRET
    });
  
    const from = 'Nexmo';
    const to = phoneNumber;
    const text = message
  
    nexmo.message.sendSms(from, to, text);

    resolve()

  })

}

router.get('/get_all_client_demand', async (req, res) => {

  res.status(200).send(clientDemands)

})

router.get('/get_last_client_demand', async (req, res) => {

  let lastClientDemand = clientDemands.pop()
  lastClientDemand = lastClientDemand == undefined ? 'ok' : lastClientDemand

  res.status(200).send(lastClientDemand)

})

router.get('/sms/:phoneNumber/:message', async (req, res) => {

  const phoneNumber = req.params.phoneNumber
  const message = req.params.message

  await sendSMS(phoneNumber, message)

  res.status(200).send({message: 'ok'})

})

router.get('/simulate_proposal', async (req, res) => {

  var options = {
    method: 'POST',
    uri: 'https://gateway.gr1d.io/sandbox/mongeral/v1/simulacao?cnpj=999999999&codigoModeloProposta=YZ',
    headers: {
      'X-Api-Key': MONGERAL_API_KEY
    },
    body: {
      "simulacoes": [
        {
          "proponente": {
            "tipoRelacaoSeguradoId": 0,
            "nome": "Jairo Iglesias",
            "cpf": "32071534883",
            "dataNascimento": "29-11-2002",
            "profissaoCbo": "Programador",
            "renda": 0,
            "sexoId":1800,
            "uf": "SP",
            "declaracaoIRId": 0
          },
          "periodicidadeCobrancaId": 0,
          "prazoCerto": 0
        }
      ]
    },
    json: true
  };

  try{

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

router.get('/search_by_board/:board_number', async (req, res) => {

  try{

    let boardNumber = req.params.board_number
    
    boardNumber = boardNumber.trim()

    var options = {
      method: 'POST',
      uri: 'https://gateway.gr1d.io/sandbox/infocar/debitoserestricoes/v1/INFOCAR_DEBITOS_E_RESTRICOES_PERSONALIZADA',
      headers: {
        'X-Api-Key': INFOCAR_API_KEY_DEBITO_RESTRICAO
      },
      body: {
        "parameters": {
          "dado": boardNumber,
          "tipo": "PLACA"
        }
      },
      timeout: 15000,
      json: true
    };

    let result = await rp(options)

    console.log(result)

    // Format Result
    const formatResult = result['soap:Envelope']
    ['soap:Body']
    ['Debitos_E_Restricoes_PersonalizadasResponse']
    ['Debitos_E_Restricoes_PersonalizadasResult']
    ['INFO-XML']
    ['RESPOSTA']

    // Adiciona a demanda no array
    clientDemands.push(formatResult)

    res.status(200).send(formatResult)

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
