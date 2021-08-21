import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  let winClass = "";

  if (props.isWinningSquare) {
    winClass = " winningSquare";
  }

  return (
    <button className={"square" + winClass} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let isWinningSquare = false;

    if (this.props.winningSquares !== undefined) {
      for (let k = 0; k < this.props.winningSquares.length; k++) {
        if (i === this.props.winningSquares[k]) {
          isWinningSquare = true;
        }
      }
    }

    return (
      <Square
        key={i}
        isWinningSquare={isWinningSquare}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let board = [];
    let key = 0;

    for (let i = 0; i < 3; i++) {
      let columns = [];
      for (let j = 0; j < 3; j++) {
        columns.push(this.renderSquare(i * 3 + j));
        key++;
      }
      let row = (
        <div key={key} className="board-row">
          {columns}
        </div>
      );
      board.push(row);
    }

    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          coordinate: null,
          symbol: null,
          winningSquares: [],
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      reorderMoves: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const coord = getCoordinate(i);

    if (squares[i]) {
      return;
    }

    if (calculateWinner(current.squares) !== null) {
      if (calculateWinner(current.squares).squares) {
        return;
      }
    }

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          coordinate: coord,
          symbol: squares[i],
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  reorderList = () => {
    this.setState({
      reorderMoves: !this.state.reorderMoves,
    });
  };

  toggleButton() {
    return (
      <button className="toggleButton" onClick={this.reorderList}>
        Toggle list order
      </button>
    );
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerObj = calculateWinner(current.squares);
    const moveNum = this.state.stepNumber;
    let winner = null;
    let stepCount = 0;

    if (winnerObj !== null) {
      winner = winnerObj.squares;
      current.winningSquares = winnerObj.line;
    }

    let moves = history.map((step, move) => {
      let classBold = "none";

      if (stepCount === this.state.stepNumber) {
        classBold = "activeListButton";
      }

      const desc = move
        ? "Go to move #" +
          move +
          " by " +
          step.symbol +
          ". Coordinates = " +
          step.coordinate
        : "Go to game start";

      stepCount++;

      return (
        <li key={move}>
          <button className={classBold} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    if (this.state.reorderMoves === true) {
      let newMovesList = [];
      for (let i = 0; i < moves.length; i++) {
        newMovesList.push(moves[moves.length - (i + 1)]);
      }
      moves = newMovesList;
    }

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    if (winner === null && moveNum === 9) {
      status = "It's a tie";
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={current.winningSquares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{this.toggleButton()}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { squares: squares[a], line: lines[i] };
    }
  }
  return null;
}

function getCoordinate(index) {
  if (index === null) return null;
  let coordinates = {
    0: "row: 1, column: 1",
    1: "row: 1, column: 2",
    2: "row: 1, column: 3",
    3: "row: 2, column: 1",
    4: "row: 2, column: 2",
    5: "row: 2, column: 3",
    6: "row: 3, column: 1",
    7: "row: 3, column: 2",
    8: "row: 3, column: 3",
  };
  return coordinates[index];
}
