import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
import App from './App';

// ReactDOM.render(<App />, document.getElementById('root'));

class EvotorService {
    // https://api.evotorservice.ru/user/01-000000000738894/stores/a06c4306-732d-4914-9543-a588af06c683
    _apiBase = 'https://api.evotorservice.ru';
    //_apiBase = 'http://127.0.0.1:8000';
    async getResource(url) {
        const userId = '01-000000000738894';
        const token = 'a06c4306-732d-4914-9543-a588af06c683';

        //const body = JSON.stringify(data);
        //const headers = new Headers({
            //'Content-Type': 'application/json;charset=utf-8',
            //Authentication: 'a06c4306-732d-4914-9543-a588af06c683',
        //});

        const response = await fetch(`${this._apiBase}/user/${userId}/${url}/${token}`);

        // получить один заголовок
        // alert(response.headers.get('Content-Type')); // application/json; charset=utf-8

        // перебрать все заголовки
        //for (let [key, value] of response.headers) {
        //    alert(`${key} = ${value}`);
        //}


        if(!response.ok){
            throw new Error(`Could not fetch ${url}, received ${response.status}`)
        }
        return await response.json();
    }

    getAllStores(){
        return this.getResource(`stores`)
    }


}


const evotorService = new EvotorService();
evotorService.getAllStores().then((body) =>{
    console.log(body);
});




