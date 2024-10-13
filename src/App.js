import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';


const socket = io.connect('http://localhost:3001/')

function App() {

  const [message, setmessage] = useState('')
  // const boardElement = document.querySelector('.chessboard');
  // console.log(boardElement)

  let draggedPiece = null;
  let sourceSquare = null;
  let PlayerRole = null;



  const [recivedmessage, setrecivedmessage] = useState([])

  const chess = new Chess();



  const handleMove = (source, target) => {
    const move = {
      from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
      to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
      promotion: 'q'
    }
    console.log('move valiable for peice : ', chess.moves({ square: `${String.fromCharCode(97 + source.col)}${8 - source.row}` }))
    socket.emit('move', move)
  }

  socket.on('PlayerRole', function (role) {
    PlayerRole = role;
    console.log('Your role is :', role)
    const boardElementfake = document.querySelector('.chessboard');
    <div class="alert alert-primary" role="alert">
      This is a primary alert—check it out!
    </div>
    let Alertvalue = document.getElementById('Alertvalue');
    Alertvalue.classList.add('alert', 'alert-primary', 'text-center', 'my-0')

    if (PlayerRole === 'w') {
      Alertvalue.innerHTML = 'You are <Strong>White</Strong>';
    }
    else if (PlayerRole === 'b') {
      Alertvalue.innerHTML = 'You are <Strong>Black</Strong>';
    }

    renderBoard(boardElementfake);
  })

  useEffect(() => {
    // Use vanilla JS to select and log the div

    const boardElement = document.querySelector('.chessboard');
    console.log(boardElement)
    renderBoard(boardElement);
    let Alertvalue = document.getElementById('Alertvalue');



    socket.on('spectatorRole', function () {
      PlayerRole = null;
      renderBoard(boardElement);
    })

    socket.on('boardState', function (fen) {
      console.log('fen recived as :', fen)
      try {
        chess.load(fen);  // Try to load the FEN string
      } catch (error) {
        console.error('Error loading FEN:', error.message);
      }
      renderBoard(boardElement);
    })

    socket.on('move', function (move) {
      chess.load(move);
      renderBoard(boardElement);
      if (chess.isCheckmate()) {
        Alertvalue.classList.add('alert-danger')
        Alertvalue.innerHTML = 'Its the <Strong>CheckMate move...!</Strong>';
      }
    })

    socket.on('receive_message', (data) => {
      console.log(recivedmessage, data)
      // setrecivedmessage(data.message)
      setrecivedmessage(prev => [...prev, data.message])
    })

  }, [socket]);

  const renderBoard = (boardElement) => {
    const board = chess.board();
    boardElement.innerHTML = '';

    board.forEach((row, rowindex) => {
      row.forEach((square, squareindex) => {
        const squareelement = document.createElement('div')
        squareelement.classList.add('square',
          (rowindex + squareindex) % 2 === 0 ? 'light' : 'dark'
        )

        squareelement.dataset.row = rowindex;
        squareelement.dataset.col = squareindex;
        // console.log('rowise indexing:',rowindex,squareindex)

        // if(!square){
        //   const circlele = document.createElement('span');
        //   circlele.classList.add('circle')
        //   squareelement.appendChild(circlele);
        // }

        let rowtofit;
        let coltofit;
        if (square) {
          const pieceElement = document.createElement('div');
          pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black')
          pieceElement.innerHTML = getPieceUnicode(square);
          pieceElement.draggable = PlayerRole === square.color;



          pieceElement.addEventListener('dragstart', (e) => {
            if (pieceElement.draggable) {
              draggedPiece = pieceElement;
              sourceSquare = { row: rowindex, col: squareindex }
              e.dataTransfer.setData('text/plain', '')
            }
            console.log('move valiable for peice main : ', chess.moves({ square: `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}` }))
            let lis = chess.moves({ square: `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}` })

            // Map through each item and remove the first character only if the string has 3 characters
            lis = lis.map(move => (move.length === 4 ? move.substring(1) : move));
            lis = lis.map(move => (move.length === 3 ? move.substring(1) : move));
            console.log('list we have', lis)
            let key;
            for (key in lis) {
              // console.log('lis',lis[key] ,'converting to :',lis[key].split(''))
              let letter = lis[key].split('')[0]
              letter = letter.charCodeAt(0) - 97;
              console.log(key)
              rowtofit = parseInt(lis[key].split('')[1])
              coltofit = parseInt(letter);
              console.log('rowindex:', 8 - rowtofit, 'colIndex:', coltofit)
              let targetSquare = document.querySelector(`.square[data-row="${8 - rowtofit}"][data-col="${coltofit}"]`);

              // Add the 'circle' class to the selected div
              if (targetSquare) {
                let circlele = document.createElement('span');
                circlele.classList.add('circle')
                targetSquare.appendChild(circlele);
              }
              // if(squareelement.dataset.row==rowtofit && squareelement.dataset.col==coltofit){
              // const circlele = document.createElement('span');
              // circlele.classList.add('circle')
              // squareelement.appendChild(circlele);
              // }

            }


            // console.log('col:', sourceSquare.col, 'row:', sourceSquare.row, squareelement)
          })

          pieceElement.addEventListener('dragend', (e) => {
            draggedPiece = null;
            sourceSquare = null;
          })
          squareelement.appendChild(pieceElement);
        }



        squareelement.addEventListener('dragover', function (e) {
          e.preventDefault();
        })

        squareelement.addEventListener('drop', (e) => {
          e.preventDefault();
          if (draggedPiece) {
            const targetSource = {
              row: parseInt(squareelement.dataset.row),
              col: parseInt(squareelement.dataset.col)
            }
            console.log(draggedPiece, targetSource)
            handleMove(sourceSquare, targetSource)
          }
        })
        boardElement.appendChild(squareelement)
      })
    });

    if (PlayerRole === 'b') {
      boardElement.classList.add('flipped');
    }
    else {
      boardElement.classList.remove('flipped');
    }

  }


  // unicode
  const getPieceUnicode = (piece) => {
    const unicodePieces = {
      p: '♟',
      r: '♜',
      n: '♞',
      b: '♝',
      q: '♛',
      k: '♚',
      P: '♙',
      R: '♖',
      N: '♘',
      B: '♗',
      Q: '♕',
      K: '♔'
    };
    if (piece.color === 'w' && piece.type === 'p') {
      return '♙';
    }
    if (piece.color === 'b' && piece.type === 'p') {
      return '♙';
    }
    return unicodePieces[piece.type] || '';
  }







  // useEffect(() => {
  //   socket.on('receive_message',(data)=>{
  //     setrecivedmessage(data.message)
  //   })
  // }, [socket])

  const submitmessage = () => {
    socket.emit('send_message', { message: message })
    setmessage('')
  }

  return (
    <div className="App">

      {/* <input onChange={(event) => {
        setmessage(event.target.value);
      }} /> */}

      <div class="input-group mb-3 my-4">
        <input type="text" class="form-control" placeholder="Type your message" aria-describedby="basic-addon2" onChange={(event) => {
          setmessage(event.target.value);
        }} />
        <div class="input-group-append">
          <button class="btn  btn-success " onClick={submitmessage} type="button">Button</button>
        </div>
      </div>


      {/* <button onClick={submitmessage} type="button" class="btn btn-success">Send</button> */}
      {/* <button onClick={submitmessage}>send message</button> */}
      <h1>Message :</h1>
      {recivedmessage.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </div>
  );
}

export default App;
