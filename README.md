# JWT Secured API 🗝️🔒       

JWT Secured API is a simple project created by me, dedicated for learning JWT or [JSON Web Tokens](https://jwt.io/) as a authentication and authorization process.          


In this project, I am using JWT with Express and Node.js, along with [express-validator](https://express-validator.github.io/docs/) as a validation input and [Prisma](https://www.prisma.io/) as a ORM to connect with [SQLite](https://sqlite.org/index.html) database.      

To test this API locally, you need to have [Node.js](https://nodejs.org/en/) installed on your local machine. Then, kindly download the zip file of the source code. After extract the folder, open the terminal and type       

```Shell
	npm install
	// This will install all the dependencies of the project
```       


I have use Nodemon along this API development. To run this API using Nodemon, simply type     

```Shell
  	npm run dev
```          

then, it will listening port on `3275`       

or, you can use built-in Node.js server. Just type       

```Shell
  	npm run serve
```          

then, it will listening port on `3275`       

## Public routes         

These routes is available publicly without sending tokens in request header.         

`GET`: `http://localhost:3275`        
`POST`: `http://localhost:3275/auth/signup`          
`POST`: `http://localhost:3275/auth/login`         
`GET`: `http://localhost:3275/post`        
`GET`: `http://localhost:3275/post/:id`         
`GET`: `http://localhost:3275/user`       
`GET`: `http://localhost:3275/user/:id`       

## Protected routes        

These routes is needed a tokens in request header to access it. The tokens can be obtained from `http://localhost:3275/auth/signup` as a `POST` request if you does not signed up, or `http://localhost:3275/auth/login` as a `POST` if you have signed up.          

`POST`: `http://localhost:3275/post`       
`PATCH`: `http://localhost:3275/post/:id`       
`DELETE`: `http://localhost:3275/post/:id`       
`PATCH`: `http://localhost:3275/user/:id`       
`DELETE`: `http://localhost:3275/user/:id`       
