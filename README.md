# Dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.4. 
App displays the most relevant parts of your [Spring Boot](http://projects.spring.io/spring-boot/) 
application infrastructure on one dashboard page.

## Application created using:

- [Bootstrap](https://ng-bootstrap.github.io/#/home)
- [ngx pagination](https://www.chartjs.org/)
- [Chart.js](https://projectlombok.org/download)

## How it works
### Angular app
All you need to do is to set up `serverUrl` in `dashboard\src\environments\environment.ts`

```shell
serverUrl: 'http://localhost:8080/actuator'
```

### Spring Boot app

Address from serverUrl `http://localhost:8080/actuator` in Angular app represents local server and port
on which Spring Boot app runs. Port `8080` is the default port but you can specify different one in your
`application.properties` file. A “discovery page” is added with links to all the endpoints. The “discovery page” 
is available on `/actuator` by default.

[Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html)
 allows you retrieve and define metrics about the state of your application for monitoring purposes
 
The recommended way to enable the features is to add a dependency:

* Maven:
```shell
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```
* Gradle:
```shell
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
}
```
After adding the dependency you need to enable endpoints in `application.properties` file:

```shell
management.endpoints.web.exposure.include=*, httptrace
management.endpoint.health.show-details=always
management.health.db.enabled=true
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Screenshot

![dashboard](src/assets/Admin%20Dashboard.png)

