# Addresses

> Component which fetches the addresses from an api and displays the markup

[Example](../../pages/Addresses.html)

## API

Use the attribute `api-url` to provide the url for fetching the data:

```html
<m-steps-addresses api-url="http://localhost:3000/src/es/components/molecules/addresses_data/addresses.json"></m-steps-addresses>
```

## Mock Data

[Example JSON](./_data/addresses.json)

Example Mock `api-url`: `http://localhost:3000/src/es/components/molecules/addresses_data/addresses.json`

## Testing

- Mobile: Addresses are displayed below each other
- Desktop: Addresses are displayed in a two column layout