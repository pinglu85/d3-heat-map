const url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

//colors from colorbrewer
//http://colorbrewer2.org/
const color = [
  '#67001f',
  '#b2182b',
  '#d6604d',
  '#f4a582',
  '#fddbc7',
  '#f7f7f7',
  '#d1e5f0',
  '#92c5de',
  '#4393c3',
  '#2166ac',
  '#053061',
];

d3.json(url)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => console.log(err));
