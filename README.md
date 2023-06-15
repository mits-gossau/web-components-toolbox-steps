# web-components-toolbox-steps

Official frontend repository of [steps.ch](https://steps.ch)

## Scripts

👇 Update web-components-toolbox submodule

```
npm run update
```

👇 Run web server with demo pages

```
npm run serve
```

👇 Automatic fix code with Standard JS

```
npm run fix
```

## Local JSON Server

Install JSON Server

```
npm install -g json-server
```

Run JSON Server with mock events

```
cd src/es/components/organisms/eventList/
```

```
json-server --watch example-events.json --port 3003
```

Now you are able to fetch the mock events under [http://localhost:3003/events](http://localhost:3003/events).

For more information about JSON Server take a look at [https://github.com/typicode/json-server](https://github.com/typicode/json-server).
