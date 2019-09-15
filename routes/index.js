let express = require('express');
let router = express.Router();
let rp = require('request-promise');
const Nexmo = require('nexmo');

// const INFOCAR_API_KEY_PARECER_TECNICO = '2c6928e2-d39f-448b-a7b1-c40065e50e3e'

const {
  INFOCAR_API_KEY_DEBITO_RESTRICAO,
  MONGERAL_API_KEY,
  NEXMO_API_KEY,
  NEXMO_API_SECRET
} = process.env

let clientPolicies = []

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

router.get('/clear_all_policy', async(req, res) => {

  clientPolicies = []

  res.status(200).send({
    message: 'All Cliente Policies Clear'
  })

})

router.get('/get_all_policies', async (req, res) => {

  let customPayloads = clientPolicies.map(policy => policy.customPayload)

  res.status(200).send(customPayloads)

})

router.get('/get_last_client_policy', async (req, res) => {

  let lastClientPolicy = clientPolicies.pop()
  lastClientPolicy = lastClientPolicy == undefined ? 'ok' : lastClientPolicy

  res.status(200).send(lastClientPolicy)

})

router.get('/get_last_client_policy/noclear', async (req, res) => {

  // let lastClientPolicy = clientPolicies.pop()
  let lastClientPolicy = clientPolicies.slice(-1)[0]
  lastClientPolicy = lastClientPolicy == undefined ? 'ok' : lastClientPolicy

  res.status(200).send(lastClientPolicy)

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

    let temp = formatResult.VEICULO.MARCADESC.split('/')


    const customPayload = {
      owner: {
        name: formatResult.PROPRIETARIO.NOMEPROPRIETARIO,
        age: 25,
        score: 500,
        avatar: 'https://s3.amazonaws.com/igd-wp-uploads-pluginaws/wp-content/uploads/2016/05/30105213/Qual-e%CC%81-o-Perfil-do-Empreendedor.jpg'
      },
      car: {
        brand: temp[0],
        model: temp[1],
        year: formatResult.VEICULO.ANOMODELO,
        odometer: 40000,
      }
    }

    const reg = {
      formatResult,
      customPayload
    }

    // Adiciona a demanda no array
    clientPolicies.push(reg)

    res.status(200).send(reg)

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
