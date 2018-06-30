//importando pacotes
var express = require('express');
var app = express();
var bodyParser =  require('body-parser');
var mongoose = require('mongoose');
var Produto =  require('./app/models/product');


mongoose.connect('mongodb://localhost:27017/bdCrud');




//configurar o app para usar o body-parser
app.use(bodyParser.urlencoded({extended : true})); //parser de urlEncoded
app.use(bodyParser.json()); //parser de Json

//definindo a porta onde o servidor vai responder
var port = process.env.port || 8000;

var router = express.Router(); //intercepta todas as rotas

//MIDDLEWARE
router.use(function (req,res,next){
    //poderão ser implementados middlewares de LOG, ERRO.
    console.log("Interceptação pelo middleware ok");
    next();
});

router.get('/', function(req, res){
    res.json({'message':'OK, rota de teste está funcionando'});
});


router.route('/produtos')
      .post(function (req,  res) {
        var produto = new Produto();
        produto.nome = req.body.nome;
        produto.preco = req.body.preco;
        produto.descricao = req.body.descricao;

        produto.save(function (error) {
            if (error){
                res.send("Erro ao salvar produto");
            }
            res.send("produto  inserido com sucesso");
        });
      })
      .get(function (req, res) {
          // Produto.find({}, 'descricao', function (err, prods) {
            Produto.find(function (err, prods) {
                if(err){
                    res.send(err);
                }

                res.status(200).json({
                    message: "produtos buscados com sucesso",
                    todosProdutos:prods
                });
            });
      });


router.route('/produtos/:productId')
      .get(function (req, res){
            const id = req.params.productId;
            Produto.findById(id, function (err, produto){
                if (err){
                    res.status(500).json({
                        message: "Erro ao encontrar produto, Id mal formado"
                    });
                }else if (produto ==  null){
                    res.status(400).json({
                        message: "Produto não encontrado."
                    });
                }else{
                    res.status(200).json({
                        message: "Produto encontrado",
                        produto: produto
                    });                    
                }
            });
      })
      .put(function (req, res){
        const id = req.params.productId;
        Produto.findById(id, function (err, produto){
            if (err){
                res.status(500).json({
                    message: "Erro ao encontrar produto, Id mal formado"
                });
            }else if (produto ==  null){
                res.status(400).json({
                    message: "Produto não encontrado."
                });
            }else{
                produto.nome =  req.body.nome;
                produto.preco = req.body.preco;
                produto.descricao = req.body.descricao;

                produto.save(function (erro){
                    if (erro){
                        res.send("Erro ao atualizar produto. " + erro);
                    }

                    res.status(200).json({message: "produto atualizado com sucesso"});
                });                
            }
        });
    })
    .delete(function(req, res){
        Produto.findByIdAndRemove(req.params.productId, (err, produto) => {
            if (err) {
                res.status(500).json({erro: "Erro ao excluir produto"});
                return;
            }               
            
            const response = {
                message: "produto removido com sucesso",
                id: produto.id
            }

            res.send(response);
        });
    });
    
    


app.use('/api', router);
app.listen(port);
console.log("API Server is up and running! on port " + port);