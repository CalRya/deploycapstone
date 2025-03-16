import React from 'react'
import '../css/DigiLib.css'
import QuoteGame from './QuoteGame';
import SpinWheel from './SpinWheel';
import Recommend from './Recommend';
import SortbyGenre from './Sortbygenre';

const GameHome = () => {
  return (
    <div className= 'digilib'>
        <h1  style={{color: 'rgb(186, 138, 114)'}}> GAMES HERE! </h1> <br/>
        <QuoteGame/>
        <SpinWheel/>
        <Recommend/>
        <SortbyGenre/>
        <br/>
    </div>
  )
}

export default GameHome
