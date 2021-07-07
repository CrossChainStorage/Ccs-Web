import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppRouter from './router/AppRouter';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import React from 'react';

// eslint-disable-next-line react/react-in-jsx-scope
// ReactDOM.render(<AppRouter />, document.getElementById('root'));
ReactDOM.render(
    <React.StrictMode>
        <AppRouter />
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
