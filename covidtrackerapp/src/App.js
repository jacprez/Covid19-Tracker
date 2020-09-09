import React, { useState , useEffect } from 'react';
import { FormControl , Select , MenuItem, Card, CardContent} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import './App.css';
import { sortData , prettyPrintStat} from "./util";
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {

  //  HOOKS
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountyInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCounteries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then(data => {
      setCountyInfo(data);
    });
  }, []);

  useEffect(() => {

    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));
          const sortedData= sortData(data)
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value; //grabs the selected value that was clicked on
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)
      setCountyInfo(data)

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  };

  console.log(countryInfo);

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
              <h1>COVID-19 TRACKER</h1>
              <FormControl className="app_dropdown">
                <Select 
                  variant="outlined" 
                  onChange={onCountryChange} 
                  value={country}>
                  {/* loop through all of the countries and show a drop down list of all the options */}
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                  {countries.map((country) => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))}

                </Select>
              </FormControl>
        </div>
        <div className="app_stats">
              <InfoBox 
              isRed
              active={casesType === "cases"}
              onClick={(e) => setCasesType('cases')}
              title="Coronavirus Cases" 
              cases={prettyPrintStat(countryInfo.todayCases)} 
              total={numeral(countryInfo.cases).format("0,0")} 
              />
              <InfoBox 
              active={casesType === "recovered"}
              onClick={(e) => setCasesType('recovered')}
              title="Recovered" 
              cases={prettyPrintStat(countryInfo.todayRecovered)} 
              total={numeral(countryInfo.recovered).format("0,0")} 
              />
              <InfoBox 
              isGray
              active={casesType === "deaths"}
              onClick={(e) => setCasesType('deaths')}
              title="Deaths" 
              cases={prettyPrintStat(countryInfo.todayDeaths)} 
              total={numeral(countryInfo.deaths).format("0,0")} 
              />
        </div>
        
          <Map 
            casesType={casesType}
            countries={mapCounteries}
            center={mapCenter}
            zoom={mapZoom}
          />
        
      </div>
      <Card className="app_right">
      <CardContent>
          <div className="app_information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph className="app_graph" casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
      
  );
}

export default App;
