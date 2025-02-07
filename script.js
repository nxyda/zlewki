document.addEventListener('DOMContentLoaded', () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
    const tubes = document.querySelectorAll('.test-tube');
    const undoButton = document.getElementById('undo-button');
    const newGameButton = document.getElementById('new-game-button');
    const winMessage = document.getElementById('win-message');
    let currentSelection = null;
    let moveHistory = [];
    let undoCount = 5;
    let startTime;
    let timerInterval;

    function startTimer() {
        let isFirstMove = true;

        function handleClick() {
            if (isFirstMove) {
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);
                isFirstMove = false;
                tubes.forEach(tube => {
                    tube.removeEventListener('click', handleClick);
                });
            }
        }

        tubes.forEach(tube => {
            tube.addEventListener('click', handleClick);
        });
    }


    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updateTimer() {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function updateUndoButtonText() {
        undoButton.textContent = `Cofnij (${undoCount} pozostało)`;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function fillTubes() {
        let allColors = [];
        colors.forEach(color => {
            for (let i = 0; i < 4; i++) {
                allColors.push(color);
            }
        });

        shuffle(allColors);

        tubes.forEach(tube => {
            tube.innerHTML = '';
            const maxCapacity = tube.classList.contains('small') ? 2 : 4;
            for (let i = 0; i < maxCapacity; i++) {
                if (allColors.length > 0) {
                    const colorDiv = document.createElement('div');
                    colorDiv.classList.add('color');
                    colorDiv.style.backgroundColor = allColors.pop();
                    tube.appendChild(colorDiv);
                }
            }
        });
    }

    function selectColor(tube, colorDiv) {
        const topColor = tube.lastElementChild;
        if (currentSelection && currentSelection.color !== colorDiv) {
            const targetTubeCapacity = tube.classList.contains('small') ? 2 : 4;
            const targetTubeEmpty = tube.childNodes.length < targetTubeCapacity;
            const sameColor = currentSelection.color.style.backgroundColor === colorDiv.style.backgroundColor;

            if (targetTubeEmpty && (sameColor || tube.childNodes.length === 0)) {
                const movingColors = getTopSameColorBlocks(currentSelection.tube, currentSelection.color.style.backgroundColor);

                if (tube.childNodes.length + movingColors.length <= targetTubeCapacity) {
                    moveHistory.push({ from: currentSelection.tube, to: tube, blocks: movingColors });
                    movingColors.forEach(block => tube.appendChild(block));
                    clearSelection();
                    checkWin();
                } else {
                    clearSelection();
                }
            } else {
                clearSelection();
            }
        } else if (topColor && topColor === colorDiv && tube.lastElementChild === colorDiv) {
            currentSelection = { tube, color: colorDiv };
            colorDiv.style.border = '2px solid black';
        }
    }

    function getTopSameColorBlocks(tube, color) {
        const blocks = [];
        for (let i = tube.childNodes.length - 1; i >= 0; i--) {
            if (tube.childNodes[i].style.backgroundColor === color) {
                blocks.push(tube.childNodes[i]);
            } else {
                break;
            }
        }
        return blocks.reverse();
    }

    function clearSelection() {
        if (currentSelection) {
            currentSelection.color.style.border = '';
            currentSelection = null;
        }
    }

    function checkWin() {
        const largeTubes = Array.from(tubes).filter(tube => !tube.classList.contains('small'));
        let winCount = 0;

        largeTubes.forEach(tube => {
            const blocks = Array.from(tube.childNodes);

            if (blocks.length === 4 && new Set(blocks.map(block => block.style.backgroundColor)).size === 1) {
                winCount++;
            }
        });

        if (winCount === 6) {
            stopTimer();
            winMessage.classList.remove('hidden');
            undoButton.disabled = true;
        }
    }




    function getNeighbors(block) {
        const neighbors = [];
        const parentTube = block.parentElement;
        const index = Array.from(parentTube.childNodes).indexOf(block);
        if (index > 0) neighbors.push(parentTube.childNodes[index - 1]);
        if (index < parentTube.childNodes.length - 1) neighbors.push(parentTube.childNodes[index + 1]);
        return neighbors;
    }

    undoButton.addEventListener('click', () => {
        if (moveHistory.length > 0 && undoCount > 0) {
            const lastMove = moveHistory.pop();
            lastMove.blocks.forEach(block => lastMove.from.appendChild(block));
            undoCount--;
            updateUndoButtonText();
        }
    });

    newGameButton.addEventListener('click', () => {
        stopTimer();
        fillTubes();
        document.getElementById('time').textContent = `${0}:${0 < 10 ? '0' : ''}${0}`;
        startTimer();
        undoCount = 5;
        updateUndoButtonText();
        moveHistory = [];
        winMessage.classList.add('hidden');
        undoButton.disabled = false;
    });


    tubes.forEach(tube => {
        tube.addEventListener('click', event => {
            if (event.target.classList.contains('color') && tube.lastElementChild === event.target) {
                selectColor(tube, event.target);
            } else if (tube === event.target && currentSelection) {
                const targetTubeCapacity = tube.classList.contains('small') ? 2 : 4;
                const topColor = tube.lastElementChild?.style.backgroundColor;
                const sameColor = currentSelection.color.style.backgroundColor === topColor;
                const movingColors = getTopSameColorBlocks(currentSelection.tube, currentSelection.color.style.backgroundColor);

                if (tube.childNodes.length + movingColors.length <= targetTubeCapacity && (sameColor || tube.childNodes.length === 0)) {
                    moveHistory.push({ from: currentSelection.tube, to: tube, blocks: movingColors });
                    movingColors.forEach(block => tube.appendChild(block));
                    clearSelection();
                    checkWin();
                }
            }
        });
    });

    fillTubes();
    updateUndoButtonText();
    startTimer();
});
