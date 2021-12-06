'use strict';

const boardElement = document.getElementById("board");
const btn1 = document.getElementById("btn1");


var html;
var board;
var playerBlack = "Black";
var playerWhite = "White";
var cx,cy,area;
var cyMultiplier;
var deneme;

//Updates UI, according to board
const updateUI = function(board){    
    //need to reset the html code at the beginning of every update
    html ="";

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
            1) 11.5 is average of the board (from 0 to 23)
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
            html += '<circle cx='+cx+' cy="'+cy+'" r="6.5" fill="'+checker+'" stroke="red" stroke-width="0.2"/>"';
            
            cy += cyMultiplier * 13;
        });
    });

    //Sends our html value to index.html
    boardElement.innerHTML = html;
}
//Creates new game
const newGame = function(){
    //Create new board
    board = [];

    //Board should contain 24 Cells, cells have to be stack
    for (let i = 0; i < 24; i++) {
        board.push([]);
    }

    //Initial positions of checkers
    for(let i = 0; i<5;i++){
        board[5].push(playerBlack);
        board[12].push(playerBlack);    
        board[11].push(playerWhite);
        board[18].push(playerWhite);
        
        if(i<3){
            board[7].push(playerBlack);
            board[16].push(playerWhite);
        }

        if(i<2){
            board[0].push(playerWhite);
            board[23].push(playerBlack);
        }
    }

    //Updates board
    updateUI(board);
} 

newGame()
btn1.addEventListener('click',function(e){
    e.preventDefault()    
    
    if(board[0].length>0)
        board[11].push(board[0].pop())
    console.log(board)
    updateUI(board);
  })
