<h3 align="center">
  Desafio 05: Banco de dados e upload de arquivos no Node.js
</h3>

## :rocket: Sobre o desafio

Nesse desafio continuamos desenvolvendo a aplicação de gestão de transações, treinando o que foi aprendido sobre Node.js com TypeScript, e agora incluindo o uso de banco de dados com o TypeORM e envio de arquivos com o Multer.

Essa é uma aplicação que armazena transações financeiras de entrada e saída e permite o cadastro e a listagem dessas transações, além de permitir a criação de novos registros no banco de dados a partir do envio de um arquivo csv.

## Instalação

Para instalar o projeto localmente na sua máquina basta clonar o repositório:

```bash
git clone https://github.com/gpmarchi/gostack-nova-jornada-desafio-05.git && cd gostack-nova-jornada-desafio-05
```

E rodar o comando abaixo para instalar as dependências necessárias:

```bash
yarn
```

## Rotas da aplicação

Abaixo estão as rotas da aplicação e o que cada uma faz:

- **`POST /transactions`**: A rota recebe `title`, `value`, `type`, e `category` dentro do corpo da requisição, sendo o `type` o tipo da transação, que é `income` para entradas (depósitos) e `outcome` para saídas (retiradas). Ao cadastrar uma nova transação, ela é armazenada dentro do seu banco de dados, possuindo os campos `id`, `title`, `value`, `type`, `category_id`, `created_at`, `updated_at`. Para a categoria, é utilizada uma nova tabela, que tem os campos `id`, `title`, `created_at`, `updated_at`. Antes da criação de uma nova categoria, é feita a verificação para validar se já existe uma categoria com o mesmo título. Caso ela exista, é usado o `id` já existente no banco de dados.

```json
{
  "id": "uuid",
  "title": "Salário",
  "value": 3000,
  "type": "income",
  "category": "Alimentação"
}
```

- **`GET /transactions`**: Essa rota retorna uma listagem com todas as transações que foram cadastradas até o momento, junto com o valor da soma de entradas, retiradas e total de crédito. Essa rota retorna um objeto com o seguinte formato:

```json
{
  "transactions": [
    {
      "id": "uuid",
      "title": "Salário",
      "value": 4000,
      "type": "income",
      "category": {
        "id": "uuid",
        "title": "Salary",
        "created_at": "2020-04-20T00:00:49.620Z",
        "updated_at": "2020-04-20T00:00:49.620Z"
      },
      "created_at": "2020-04-20T00:00:49.620Z",
      "updated_at": "2020-04-20T00:00:49.620Z"
    },
    {
      "id": "uuid",
      "title": "Freela",
      "value": 2000,
      "type": "income",
      "category": {
        "id": "uuid",
        "title": "Others",
        "created_at": "2020-04-20T00:00:49.620Z",
        "updated_at": "2020-04-20T00:00:49.620Z"
      },
      "created_at": "2020-04-20T00:00:49.620Z",
      "updated_at": "2020-04-20T00:00:49.620Z"
    },
    {
      "id": "uuid",
      "title": "Pagamento da fatura",
      "value": 4000,
      "type": "outcome",
      "category": {
        "id": "uuid",
        "title": "Others",
        "created_at": "2020-04-20T00:00:49.620Z",
        "updated_at": "2020-04-20T00:00:49.620Z"
      },
      "created_at": "2020-04-20T00:00:49.620Z",
      "updated_at": "2020-04-20T00:00:49.620Z"
    },
    {
      "id": "uuid",
      "title": "Cadeira Gamer",
      "value": 1200,
      "type": "outcome",
      "category": {
        "id": "uuid",
        "title": "Recreation",
        "created_at": "2020-04-20T00:00:49.620Z",
        "updated_at": "2020-04-20T00:00:49.620Z"
      },
      "created_at": "2020-04-20T00:00:49.620Z",
      "updated_at": "2020-04-20T00:00:49.620Z"
    }
  ],
  "balance": {
    "income": 6000,
    "outcome": 5200,
    "total": 800
  }
}
```

Dentro de balance, o income é a soma de todos os valores das transações com `type` income. O outcome é a soma de todos os valores das transações com `type` outcome, e o total é o valor de `income - outcome`. Para fazer a soma dos valores, foi utilizada a função [reduce](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) para agrupar as transações pela propriedade `type`, assim foi possível somar todos os valores com facilidade e obter o retorno do `balance`.

- **`DELETE /transactions/:id`**: A rota deletar uma transação com o `id` presente nos parâmetros da rota;

- **`POST /transactions/import`**: A rota permite a importação de um arquivo no formato `.csv` contendo as mesmas informações necessárias para criação de uma transação `id`, `title`, `value`, `type`, `category_id`, `created_at`, `updated_at`, onde cada linha do arquivo CSV deve ser um novo registro para o banco de dados, e por fim retorna todas as `transactions` que foram importadas para seu banco de dados. O arquivo csv, deve seguir o seguinte [modelo](./assets/file.csv)

## Especificação dos testes

O desafio foi resolvido seguindo a técnica de TDD. Os testes podem ser encontrados na pasta ```src/__tests__``` e para executá-los rodar o comando:

```bash
yarn test
```

Para que os testes possam ser executados corretamente é necessário que exista uma base de dados local na sua máquina com o nome gostack_desafio05_tests. Para cada teste existe uma breve descrição do que a aplicação executa para que o mesmo passe.

- **`should be able to create a new transaction`**: Para que esse teste passe, a aplicação permite que uma transação seja criada, e retorna um json com a transação criada.

- **`should create tags when inserting new transactions`**: Para que esse teste passe, a aplicação permite que ao criar uma nova transação com uma categoria que não existe, a mesma seja criada e inserida no campo category_id da transação com o `id` que acabou de ser criado.

- **`should not create tags when they already exists`**: Para que esse teste passe, a aplicação permite que ao criar uma nova transação com uma categoria que já existe, seja atribuído ao campo category_id da transação com o `id` dessa categoria existente, não permitindo a criação de categorias com o mesmo `title`.

- **`should be able to list the transactions`**: Para que esse teste passe, a aplicação permite que seja retornado um array de objetos contendo todas as transações junto ao balanço de income, outcome e total das transações que foram criadas até o momento.

- **`should not be able to create outcome transaction without a valid balance`**: Para que esse teste passe, a aplicação não permite que uma transação do tipo `outcome` extrapole o valor total que o usuário tem em caixa (total de income), retornando uma resposta com código HTTP 400 e uma mensagem de erro no seguinte formato: `{ error: string }`.

- **`should be able to delete a transaction`**: Para que esse teste passe, a aplicação permite que a rota de delete exclua uma transação, e ao fazer a exclusão, ele retorna uma resposta vazia, com status 204.

- **`should be able to import transactions`**: Para que esse teste passe, a aplicação permite que seja importado um arquivo csv, contendo o seguinte [modelo](./assets/file.csv). Com o arquivo importado, é criado no banco de dados todos os registros e categorias que estavam presentes nesse arquivo, e retornadas todas as transactions que foram importadas.
