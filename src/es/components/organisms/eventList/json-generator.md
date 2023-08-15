# JSON GENERATOR

[app.json-generator.com/hpINMz4yKYqK](https://app.json-generator.com/hpINMz4yKYqK)

[Get Data](https://api.json-generator.com/templates/hpINMz4yKYqK/data)

Personal access token: xkvmxbpx2io4tgzfiod9uzktcqbefrd7ep7528a2

```javascript
{
  "events": JG.repeat(25, 50, {
    choreographer: `${JG.firstName()} ${JG.lastName()}`,
    company: JG.company(),
    companyDetailPageUrl: 'https://' + (JG.company() + JG.domainZone()).toLowerCase(),
    eventDate: moment(JG.date(new Date(2024, 8, 15, 0, 0, 0), new Date(2024, 9, 15, 0, 0, 0))).format('DD.MM.YYYY HH:MM:SS'),
    eventInformationIcons: [
      "/src/img/icons/icon-uebertitel.svg",
      "/src/img/icons/icon-einfuehrung.svg",
      "/src/img/icons/icon-nachbesprechung.svg",
      "/src/img/icons/icon-familien.svg"
    ],
    location: JG.city(),
    presaleUrl: 'https://engagement.migros.ch/de/news-projekte/kulturfoerderung/tanzfestival-step',
    production: JG.loremIpsum(),
    soldOut: JG.random('True', 'False'),
    theater: JG.loremIpsum(),
    theaterInformationIcons: [
      "/src/img/icons/icon-hoerbenachteiligung.svg",
      "/src/img/icons/icon-rollstuhlgaengig.svg"
    ],
  })
}
```
