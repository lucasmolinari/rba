# Rinha de Backend 2024
Olá :)

Meu objetivo é adquirir o máximo de conhecimento possível, saindo da zona de conforto, com uma stack incomum entre os participantes da rinha.
## Stack
[![My Skills](https://skillicons.dev/icons?i=nodejs,mongodb,nginx,&theme=light)](https://skillicons.dev)

  
  ## Resultados
  
  ### -> Latest:
  ![image](https://github.com/lucasmolinari/rbe/assets/101225122/9e25dd8d-1867-404d-a364-b446cd8c5438)
  
  Nessa última versão, eu finalmente aprendi como usar as aggregations do MongoDB! Isso me permitiu melhorar a perfomance de um jeito absurdo, além de criar funções mais específicas
  para cada tipo de transação. O código ficou relativamente mais simples de entender e visualizar no lado da API, escondendo as coisas mais feias no lado do banco de dados.
  
  ### -> 0.0 (Primeira versão):
  ![image](https://github.com/lucasmolinari/rbe/assets/101225122/b917d763-5bd0-4545-9c6e-7ac4387cb217)
  
  
  Esse foi práticamente o primeiro teste que eu fiz quando terminei de fazer o corpo da API. 99% dos erros foram Premature Close:
  
  ![image](https://github.com/lucasmolinari/rbe/assets/101225122/819def0c-6bab-4ebb-bba9-1af7224f3260)
  Uma das causas foi dar `throw error` **sempre** que uma requisição não passava nas validações, ao invés de simplesmente retornar uma resposta  `404` ou `402`, que seja. Inclusive isso foi apontado por um amigo (agradeço profundamente o aviso).
  Outra causa, foram chamadas aninhadas (e a maioria desnecessárias) de funções que faziam requisições ao banco de dados.

  ### -> 0.5:
  ![image](https://github.com/lucasmolinari/rbe/assets/101225122/b6f5da7e-7e04-4472-9088-bd363facf9d0)
  Aqui, depois de resolver os problemas citados acima e ter dado uma otimizada no código, eu finalmente estava conseguindo ter mais requisições completas do que incompletas.
  Foi o máximo que eu consegui otimizar sem ter que fazer alterações relevantes na forma que eu escrevi as queries.
