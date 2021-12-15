'use strict';

const boardElement = document.getElementById("board");
const dice1El = document.getElementById("dice1");
const dice2El = document.getElementById("dice2");
const btnRoll = document.getElementById("btn-roll");
const hitbox = document.querySelectorAll(".hitbox");
var dice1,dice2;

var html;
var board;
var players =["White","Black"];
var cx, cy, cyMultiplier, area;
var gameStatus = "Start";
var doubleDice = false;
var currentPlayer, clickedCellPlayer;
var firstClickedCellID, secondClickedCellID;
var message;
var turn, clickCounter, move;
var isDice1Played, isDice2Played, isDicePlayed;
var moveMultiplier;
var clickedCellCheckerCount;
var hittedCheckers;
var dice1Anim, dice2Anim;
var rollingAnimation;
var targetCell;

//Updates UI, according to board
const updateUI = function(board){    
    //need to reset the html code at the beginning of every update
    html = "";

    //for every cell in the board
    board.forEach(function (cell, cellNumber) {
        //determines area
        area = cellNumber <= 5 ? 1 : cellNumber <= 11 ? 2 : cellNumber <= 17 ? 3 : 4
        
        //x calculation start from zero
        cx = 0;

        /*
            If its upper side of the board, y calculation also starts from zero
            Otherwise it should start from the bottom (cy = 165.4px). And calculation should be reverse.
            Thats why we are gonna use cyMultiplier to apply reverse calculation by simply declaring as -1
        */ 
        cy = area > 2 ? 0 : 165.4;

        /*  
            1) 11.5 is the middle of the board (from 0 to 23)
            2) Upper and bottom side of the board must have the same cx coordinates
               so we have to take absolute value to calculate how many cells we need to go |cellNumber-11.5|
            3) We need to get rid of 0.5. |cellNumber-11.5|-0.5
            4) 14px is the pixel we should go for putting our checker to the next cell.
               Multipy with our result to reach our goal (|cellNumber-11.5|-0.5)*14
            5) If its on the right side, we need to add the pixels of the middle of the board. Which is 10.2
               Right side of the board is area 1 and 4

            
            **For example: Cell 1 and Cell 22 is at 150.2px
            We need to go right 10 cells for both
            for cell 22 its 22 - 11.5 =  10.5
            for cell 1 its   1 - 11.5 = -10.5
            so calculating absolute value will give me same result for both sides
            10.5
            Get rid of 0.5
            10
            Multiply by 14 to find  which pixel I should put my checker
            10 * 14px = 140px
            These are at the right side of the board. So add the 10.2px pixel for the middle of the board
            140px + 10.2px = 150.2px
        */
        cx += (Math.abs(cellNumber-11.5)-0.5)*14;
        cx += area === 1 || area === 4 ? 10.2 :  0;
        
        //for every checker in a cell
        cell.forEach(function (checker, checkerNumber) {
            //if its at the bottom, calculation should be reverse. Area 1 and 2 is the bottom
            cyMultiplier = area <3 ? -1 : 1;

            /*
                if more than 6 checkers, to not exceed the cell we have to put it on 
                the other checkers in the cell. To see them better, I moved them
                5 and a half blocks. (13px*5.5=71.5px). It gives like pyramid shape
                second floor has the limit of 5 checkers. For the next floor
                I moved the 12th checker 4 and a half blocks (58.5px).
                We have total of 15 checkers so we don't need more floors
            */
            if(checkerNumber==6)
                cy -= cyMultiplier * 71.5;
            if(checkerNumber==11)
                cy -= cyMultiplier * 58.5;

            //we are getting html code with the parameters we calculate. checker presents the color of checkers
            html += '<circle cx=' + cx +' cy="' + cy
            + '" r="6.5" fill="' + checker + '" stroke="red" stroke-width="0.2"/>"';
            
            cy += cyMultiplier * 13;
        });
    });

    //The rest is for hitted checkers. They must seen at the middle of the board.
    //Middle of the coordinate X is 82.10
    cx = 82.10;

    //Some math to put hitted checkers to different Y coordinates.
    hittedCheckers.forEach(function (checker, checkerNumber){
        cy = 82.25;
        cyMultiplier = checkerNumber % 2 == 0 ? 1 : -1;
        for(var i=0; i <= (checkerNumber-1)/2; i++){
            cy += 13*cyMultiplier;
        }

        html += '<circle cx=' + cx +' cy="' + cy
        + '" r="6.5" fill="' + checker + '" stroke="red" stroke-width="0.2"/>"';
    });

    //Sends our html value to index.html
    boardElement.innerHTML=html;
}

//Creates new game
const newGame = function(){
    //Create new board
    board = [];

    //Array for broken checkers
    hittedCheckers = [];

    //Change the text to give more clear direction
    btnRoll.textContent = "Start!";

    //Player should roll the dice to start the game
    gameStatus = "Roll";

    //Decides which players turn. Even turns are for white, odd turns are for black player
    turn=0;

    //initial clicks are not clicked
    clickCounter = 0;

    //Board should contain 24 Cells, cells has to be stack
    for (let i = 0; i < 24; i++){
        board.push([]);
    }

    //Initial positions of checkers
    for(let i = 0; i<5;i++)
    {
        board[5].push(players[1]);
        board[12].push(players[1]);    
        board[11].push(players[0]);
        board[18].push(players[0]);
        
        if(i<3)
        {
            board[7].push(players[1]);
            board[16].push(players[0]);
        }

        if(i<2)
        {
            board[0].push(players[0]);
            board[23].push(players[1]);
        }
    }

    //Updates board
    updateUI(board);
}

const resetClicks = function(){
    clickCounter = 0;
    firstClickedCellID = null;
    secondClickedCellID = null;
}

const moveChecker = function(){
    //If its 0th cell (25th cell for black), its middle cell where hitted checkers stored
    if(firstClickedCellID == 0 || firstClickedCellID == 25){
        //Take the checker from first cell we clicked to second cell we clicked
        board[secondClickedCellID-1].push(hittedCheckers.pop());
    }
    else{
        //Take the checker from first cell we clicked to second cell we clicked
        board[secondClickedCellID-1].push(board[firstClickedCellID-1].pop());
    }    

    //If there is only one opponent in the target cell, Hit!
    if((clickedCellPlayer!=currentPlayer && (clickedCellCheckerCount == 1))){
        hittedCheckers.push(board[secondClickedCellID-1].shift());
    }
    //We moved so we need to reduce remaining move
    move--;

    //Changes UI after move
    updateUI(board);
    message = "Checker is putted on";
}

const isAbleToMove = function(dice, isDicePlayed){
    //if dice isn't played or dices are equal, And target cell is equal to dice + first cell, it is ablee to move so returns true
    return secondClickedCellID == moveableCellID(dice) && (!isDicePlayed || dice1 == dice2);
};

const moveableCellID= function(dice){
    /*Equation is for calculating the cell that player can move
    For example if player is white, cell is 10 and dices are 2 and 5
    player can move to cells 12 or 15.
    But black player should move to 8 or 5
    10 +- 2 or 10 +- 5
    this +- is move multiplier
    */
    return +firstClickedCellID + +dice * moveMultiplier;
}

const updateUIHighlightedMoves = function(){
    //If dice1 not played or dices are equal, highlight the moveable cell
    if(!isDice1Played || dice1 == dice2){
        highlightCell(moveableCellID(dice1));   
    }
    //If dice2 not played, highlight the moveablecell
    if(!isDice2Played){
        highlightCell(moveableCellID(dice2));
    }
}

const highlightCell = function(targetCellID){
    //Target can't exceeded 0 and 24
    if(targetCellID > 0 && targetCellID < 25){
        targetCell = document.getElementById(targetCellID);

        /*If there is less than 2 checker in a cell
        or there is more than 1 checker and its filled with current players checkers
        Highlight that target by changing attribute*/
        if(board[targetCellID-1].length < 2 
            || (board[targetCellID-1].length > 0 && board[targetCellID-1][0]==currentPlayer)){
            targetCell.setAttribute("fill-opacity", "0.4");
            targetCell.setAttribute("fill", "Green");
        }
    }   
}

btnRoll.addEventListener('click',function(e){
    //If game hasn't start yet
    if(gameStatus == "Start"){
        newGame();
    }

    else if(gameStatus == "Rolling Animation"){
        //Stops animation
        clearInterval(rollingAnimation);
        btnRoll.textContent = "Roll!";
        
        //Dice must be random and values are between 1 and 6
        dice1 = Math.floor(Math.random() * 6 + 1);
        dice2 = Math.floor(Math.random() * 6 + 1);
            
        //Returns dice png according to dice number
        dice1El.src="img/dice/dice-"+dice1+".png";
        dice2El.src="img/dice/dice-"+dice2+".png";
        
        //Checks double dice. If there is double dice, player should move 4 turn
        move = dice1 == dice2 ? 4 : 2;

        //Reset the dice played 
        isDice1Played = false;
        isDice2Played = false;

        //We rolled the dices. Now we can move
        gameStatus="Move";
    }
    
    //Animation
    else if(gameStatus=="Roll")
    {                
        btnRoll.textContent = "Throw!";
        
        gameStatus = "Rolling Animation";

        //Repeats until user stops
        rollingAnimation = setInterval(function() {

            //Randoms every time so it gives us animation by sending to diceEl.src
            dice1Anim = Math.floor(Math.random() * 6 + 1);
            dice2Anim = Math.floor(Math.random() * 6 + 1);                
            
            dice1El.src="img/dice/dice-"+dice1Anim+".png";
            dice2El.src="img/dice/dice-"+dice2Anim+".png";
          }, 50);
    }
    else{
        console.log("Finish the turn before rolling dices again!");
    }
  })

//There is 25 hitbox elements. So I declared event listener function for each class named hitbox
hitbox.forEach((element) => {
    element.addEventListener("click", function(){
        /*I used game status to limit player to not do some things.
        For example player shouldn't move the checkers before rolling dices
        Or player shouldn't rolling dices more than once in a turn.
        */
        if(gameStatus == "Move"){
            //First click is for pulling second click is for putting. To simplifier I used odd and even
            clickCounter++;
            clickCounter %= 2;

            //Player is decided by turn. even turns are for white, odd represents black player
            currentPlayer = players[turn % 2];

            /*When you click, I want to keep clicked cells occupied by who. 0th id is for hitted checkers
            Elements array is from 0 to 23 but id's are begins from 1 until 24
            board array represents the game board
            board[] means a cell in the board  
            board[][] means a checker in spesific cell
            */
            clickedCellPlayer = element.id=="0" ? hittedCheckers[0] : board[element.id-1][0];
            clickedCellCheckerCount = element.id=="0" ? hittedCheckers.length : board[element.id-1].length;
            
            //If its black players turn, move should be reversed
            moveMultiplier = turn % 2 == 0 ? 1: -1;
            
            //If a checker hasn't pulled yet
            if(clickCounter==1){                
                //If player clicked the cell filled with players checker
                if(currentPlayer == clickedCellPlayer){
                    //If there is no hitted checker of his own or trying to pull a hitted checker
                    if(currentPlayer != hittedCheckers[0] || element.id == "0"){
                        //Returns the clicked cell id. If its blacks turn, 0 should be 25
                        firstClickedCellID =  element.id==0 && turn % 2 == 1 ? 25 : element.id; 

                        //After first click, highlight the possible moves
                        updateUIHighlightedMoves();  
                        message="";                
                    }
                    else{
                        message = "You must play hitted checker first!";
                        /*Reset the first click because the action is not allowed 
                        and player should start from the beginning*/
                        resetClicks();                        
                    }
                }
                //Other error messages
                else{
                    //If there is no checker in a cell
                    if(!clickedCellPlayer){
                        message = "Empty Cell";
                    }
                    //If its opponents cell
                    else{
                        message =  "Wrong player! Its " + currentPlayer + "'s turn!";
                    }

                    resetClicks();
                }
            }
            //If its second click, putting action must provide
            else{
                /*If player tries to target the cell where there is his cell
                or opponents cell with a single checker*/
                if(currentPlayer == clickedCellPlayer || clickedCellCheckerCount <= 1){  

                    //Returns the clicked cell id
                    secondClickedCellID = element.id;                 

                    //If player clicks same cell
                    if(firstClickedCellID === secondClickedCellID){
                        message = "Same cell selected";
                    }
                    else{
                        /*If dices are same, player gonna move 4 times
                        so we shouldn"t take the dice out of the equation*/
                        
                        //If dice1 hasn't used yet
                        if(isAbleToMove(dice1,isDice1Played)){
                            isDice1Played = true;
                            moveChecker();                    
                        }
                        //If dice2 hasn't used yet
                        else if(isAbleToMove(dice2,isDice2Played)){
                            isDice2Played = true;
                            moveChecker();
                        }
                        //It means player try to put wrong cell.
                        else{
                            resetClicks();
                            message = "Wrong Move";
                        }                                                                      
                    }
                }
                //This means, player try to put over oppents cell
                else{
                    resetClicks();
                    message = "Wrong move! You can't put your checker onto opponents defense!";
                }
                
                hitbox.forEach((element) =>{element.setAttribute("fill-opacity", "0.0");});
            }            
        }
        //Dice hasn't rolled yet
        else{
            message = "Roll the dice first!"
        }

        //If there is no move left, that means turn has ended
        if(move==0){
            message += "\n" + currentPlayer + "'s turn Ended!"
            turn++;
            gameStatus = "Roll";
        }    
          
        console.log(message);                
    });
  });