var express = require('express');
var router = express.Router();
var sequelize = require('../models').sequelize;
var funcionario = require('../models').funcionario;
var Maquinas = require('../models').Maquinas;

var env = process.env.NODE_ENV || 'development';

router.get('/dashboard/:idSensor', function (req, res, next) {

	var idSensor = req.params.idSensor;
	let instrucaoSql = "";
	console.log('Recuperando id dos Sensores' + idSensor);

	if (env == 'dev') {

	} else if (env == 'production') {
		instrucaoSql = `select top 1 
		usoCPU,
		usoRAM,
		usoHD,
		tempGPU as temperatura,
		tempCPU as tempC,
		idDadosMaquinas,
		FORMAT(dataHora,'HH:mm:ss') as momento_grafico
		from [dbo].[dadosMaquinas] WHERE fkMaquinas = ${idSensor} ORDER BY idDadosMaquinas DESC`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}

	console.log(instrucaoSql);

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});
router.get('/processos/:idSensor', function (req, res, next) {
	var idSensor = req.params.idSensor;
	let instrucaoSql = "";

	if (env == 'dev') {

	} else if (env == 'production') {
		instrucaoSql = `select top (3) * 
		from [dbo].[Processos] where fkMaquinas = ${idSensor}
		order by idProcessos DESC;`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});
router.get('/ram/:idSensor', function (req, res, next) {
	var idSensor = req.params.idSensor;
	let instrucaoSql = "";

	if (env == 'dev') {

	} else if (env == 'production') {
		instrucaoSql = `select top 1 usoRAM as usoRAM, qntRAM
		from [dbo].[dadosMaquinas] inner join [dbo].[Maquinas]
		on fkMaquinas = idMaquinas and fkMaquinas = ${idSensor}
		ORDER BY idDadosMaquinas DESC`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}

	console.log(instrucaoSql);

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});

router.get('/ultimas/:idSensor', function (req, res, next) {
	const limite_linhas = 7;
	var idSensor = req.params.idSensor;
	console.log(`Recuperando as ultimas  capturas`);
	if (env == 'dev') {

	} else if (env == 'production') {
		instrucaoSql = `select top ${limite_linhas}
		idDadosMaquinas,
		hostname as Hostname,
		usoCPU,
		usoRAM,
		usoHD,
		FORMAT(dataHora,'HH:mm:ss') as momento_grafico
		from [dbo].[dadosMaquinas] INNER JOIN [dbo].[Maquinas]
		ON fkMaquinas = idMaquinas and fkMaquinas = ${idSensor}
		order by idDadosMaquinas desc;`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}
	sequelize.query(instrucaoSql, {
		model: funcionario,
		mapToModel: false
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});
router.get('/:idEmpresa', function (req, res, next) {
	let idEmpresa = req.params.idEmpresa;
	console.log('Recuperando todos funcionarios da empresa');
	let instrucaoSql = "";

	if (env == "dev") {
		instrucaoSql = `SELECT idMaquinas as idMaquina,
        hostname as Hostname,
        nomeResp as Nome,
        sobrenomeResp as Sobrenome,
        emailFunc as email
        FROM maquinas JOIN empresa 
        WHERE fkEmpresa = idEmpresa and fkEmpresa = ${idEmpresa}`;
	} else {
		instrucaoSql = `SELECT idMaquinas as idMaquina,
        hostname as Hostname,
        nomeResp as Nome,
        sobrenomeResp as Sobrenome,
        emailFunc as email
        FROM maquinas JOIN empresa
        ON fkEmpresa = idEmpresa and fkEmpresa = ${idEmpresa};`;
	}
	sequelize.query(instrucaoSql, {
		model: funcionario,
		mapToModel: true
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});

router.get('/cons-editar/:idFunc', function (req, res, next) {
	let idFunc = req.params.idFunc;
	let instrucaoSql = "";

	if (env == "dev") {
	} else {
		instrucaoSql = `SELECT
        hostname,
        nomeResp,
        sobrenomeResp, 
        senhaMaquina,
		emailFunc,
		loginMaquina
        FROM maquinas where idMaquinas = ${idFunc}`;
	}
	sequelize.query(instrucaoSql, {
		model: funcionario,
		mapToModel: true
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});

router.get('/media/:idMaquina', function (req, res, next) {
	let idMaquina = req.params.idMaquina;
	let instrucaoSql = "";

	if (env == "dev") {

	} else {
		instrucaoSql = `SELECT top 10 format(avg(tempCPU), '#.0') as mediaCPU,
		format(avg(tempGPU), '#.0') as mediaGPU,
		format(avg(usoRAM), '#.0') as mediaRAM
		from [dbo].[dadosMaquinas]
		where fkMaquinas = ${idMaquina}`;
	}
	sequelize.query(instrucaoSql, {
		model: funcionario,
		mapToModel: true
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});

router.delete('/deletar/:idUsuario', function (req, res, next) {
	console.log('Deletando usuario');
	var idMaquina = req.params.idUsuario;
	let instrucaoSql = "";

	if (env == 'dev') {

	} else if (env == 'production') {
		instrucaoSql = `update [dbo].[dadosMaquinas] set fkMaquinas = null where fkMaquinas = ${idMaquina}
		update [dbo].[Processos] set fkMaquinas = null where fkMaquinas = ${idMaquina}
		delete from Maquinas where idMaquinas = ${idMaquina}`;
	} else {
		console.log("\n\n\n\nVERIFIQUE O VALOR DE LINHA 1 EM APP.JS!\n\n\n\n")
	}

	console.log(instrucaoSql);

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.DELETE })
		.then(resultado => {
			window.location.href = 'dashboard.html';
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});
router.post('/cadastrar/:idEmpresa', function (req, res, next) {
	console.log('Cadastrando novo usuario');
	var idEmpresa = req.params.idEmpresa;
	Maquinas.create({
		fkEmpresa: idEmpresa,
		hostname: req.body.hostname,
		senhaMaquina: req.body.senhaMaquina,
		nomeResp: req.body.nomeResp,
		sobrenomeResp: req.body.sobrenomeResp,
		emailFunc: req.body.emailFunc,
		loginMaquina: req.body.loginMaquina

	}).then(resultado => {
		console.log(`Registro criado: ${resultado}`)
		res.send(resultado);
	}).catch(erro => {
		console.error(erro);
		res.status(500).send(erro.message);
	});
});

router.post('/atualizar/:idFuncionario', function (req, res, next) {
	console.log('atualizando informações');
	var idFuncionario = req.params.idFuncionario;
	var nomeEdit = req.body.nomeEdit;
	var sobrenomeEdit = req.body.sobrenomeEdit;
	var emailEdit = req.body.emailEdit;
	var hostnameEdit = req.body.hostnameEdit;
	var loginEdit = req.body.loginEdit;
	var senhaEdit = req.body.senhaEdit;
	var instrucaoSql;
	if (env == "dev") {
	} else {
		instrucaoSql = `update Maquinas set nomeResp ='${nomeEdit}',
		sobrenomeResp='${sobrenomeEdit}',
		emailFunc='${emailEdit}',
		hostname='${hostnameEdit}',
		loginMaquina='${loginEdit}',
		senhaMaquina='${senhaEdit}'
		where idMaquinas = ${idFuncionario};`;
	}
	console.log(instrucaoSql);
	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.UPDATE })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});

module.exports = router;