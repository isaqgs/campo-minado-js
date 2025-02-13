document.getElementById("elBtnJogar").addEventListener("click", () => {
    timer.stop()
    startGame()
})
let elDivField = document.getElementById("divField")

let timer = {
    intervalo: 0,

    start() {
        let segCount = 0
        this.intervalo = setInterval(() => {
            segCount++
            document.getElementById("timer").innerText = segCount
        }, 1000)
    },

    stop() {
        clearInterval(this.intervalo)
    }
}

function startGame() {
    document.getElementById("elFinalMsg").innerHTML = ""
    let countPlays = 0;

    //Define a quantidade de linhas, colunas e bombas de acordo com a dificuldade
    let rows, columns, qtdBombas
    switch (document.getElementById("elSelect").value) {
        case "opc1":
            rows = 10
            columns = 10
            qtdBombas = 20
            break

        case "opc2":
            rows = 10
            columns = 20
            qtdBombas = 50
            break

        case "opc3":
            rows = 12
            columns = 30
            qtdBombas = 100
            break
    }

    let countFlags = qtdBombas

    //Cria o campo do jogo
    let field = []
    for (i = 0; i < rows; i++) {
        field[i] = []
        for (j = 0; j < columns; j++) {
            field[i][j] = null
        }
    }

    //Gera o campo do jogo em HTML
    let fieldHtml = ""
    fieldHtml += "<table class='tableField' border=1>"
    for (i = 0; i < rows; i++) {
        fieldHtml += "<tr>"
        for (j = 0; j < columns; j++) {
            fieldHtml +=
                `<td data-row=${i} data-column=${j} id="${i},${j}" data-cellType="blank" class="cell"></td>`
        }
        fieldHtml += "</tr>"
    }
    fieldHtml += "</table>"
    elDivField.innerHTML = fieldHtml

    //Exibe o campo na página
    document.getElementById("divGame").style.display = "inline-block";
    document.getElementById("qtdFlags").innerText = qtdBombas
    document.getElementById("timer").innerText = 0

    //Adiciona os eventos de cliques nas células do campo do jogo
    let fieldCells = document.getElementsByClassName("cell")
    for (i = 0; i < fieldCells.length; i++) {
        fieldCells[i].addEventListener("click", (e) => {
            checkPlay(e.target)
        })
        fieldCells[i].addEventListener("contextmenu", (e) => {
            e.preventDefault()
            if (e.target.getAttribute("data-cellType") == "blank" && countPlays > 0) {
                e.target.setAttribute("data-cellType", "flag")
                countFlags--
                document.getElementById("qtdFlags").innerText = countFlags
            } else if (e.target.getAttribute("data-cellType") == "flag" && countPlays > 0) {
                e.target.setAttribute("data-cellType", "blank")
                countFlags++
                document.getElementById("qtdFlags").innerText = countFlags
            }
        })
    }

    //Funcão responsável por checar a jogada do usuário
    function checkPlay(cell) {
        let cellRow = Math.floor(cell.getAttribute("data-row"))
        let cellColumn = Math.floor(cell.getAttribute("data-column"))

        if (countPlays == 0) {
            timer.start()
            generateField(cellRow, cellColumn)
            showBlankCells(cellRow, cellColumn)
            return;
        }

        if (cell.getAttribute("data-cellType") == "blank" && cell.getAttribute("disabled") != "1") {
            if (field[cellRow][cellColumn] == "*") {
                endGame(false)
            } else if (field[cellRow][cellColumn] == 0) {
                showBlankCells(cellRow, cellColumn)
            } else {
                cell.innerHTML = field[cellRow][cellColumn]
                cell.setAttribute("data-cellType", "number")
                countPlays++
            }
        }

        if (countPlays == rows * columns - qtdBombas) {
            endGame(true)
        }
    }

    function showBlankCells(r, c) {
        let blankCells = []

        for (i = r - 1; i <= r + 1; i++) {
            for (j = c - 1; j <= c + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < columns) {
                    if (field[i][j] == 0) {
                        field[i][j] = null
                        blankCells.push([i, j])
                    }
                    if (document.getElementById(`${i},${j}`).getAttribute("data-cellType") == "blank") {
                        countPlays++
                        document.getElementById(`${i},${j}`).innerHTML = field[i][j]
                        document.getElementById(`${i},${j}`).setAttribute("data-cellType", "number")
                    }
                }
            }
        }

        blankCells.forEach((item) => {
            showBlankCells(item[0], item[1])
        })
    }

    function generateField(r, c) {
        //Gera coordenadas aleatórias paras as bombas e as adicionam a matriz do jogo
        let placedBombs = 0
        let par = []
        while (placedBombs < qtdBombas) {
            par = [Math.floor(Math.random() * rows), Math.floor(Math.random() * columns)]
            if (field[par[0]][par[1]] != "*") {
                if (par[0] < r - 1 || par[0] > r + 1 || par[1] < c - 1 || par[1] > c + 1) {
                    field[par[0]][par[1]] = "*"
                    placedBombs++
                }
            }
        }


        //Adiciona os números que definem a quantidade de bombas adjacentes nos espaços em branco
        for (i = 0; i < rows; i++) {
            for (j = 0; j < columns; j++) {
                if (field[i][j] != "*") {
                    let count = 0
                    for (r = i - 1; r <= i + 1; r++) {
                        for (c = j - 1; c <= j + 1; c++) {
                            if (r >= 0 && r < rows && c >= 0 && c < columns) {
                                if (field[r][c] == "*") count++
                            }
                        }
                    }
                    field[i][j] = count
                }
            }
        }

        console.table(field)
    }

    function endGame(win) {
        let msg = win ? "Você venceu!" : "Você perdeu!"

        for (i = 0; i < fieldCells.length; i++) {
            if (field[fieldCells[i].getAttribute("data-row")][fieldCells[i].getAttribute(
                    "data-column")] == "*") {
                if (win) {
                    fieldCells[i].setAttribute("data-cellType", "savedBomb")
                } else {
                    fieldCells[i].setAttribute("data-cellType", "bomb")
                }
            } else {
                fieldCells[i].setAttribute("disabled", "1")
            }
        }
        timer.stop()
        document.getElementById("elFinalMsg").innerHTML = msg
    }
}