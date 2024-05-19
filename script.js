document.addEventListener('DOMContentLoaded', () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
    const tubes = document.querySelectorAll('.test-tube');
    const undoButton = document.getElementById('undo-button');
    const newGameButton = document.getElementById('new-game-button');
    let currentSelection = null;
    let moveHistory = [];

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

                // Check if the move is valid considering the remaining capacity
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
        let won = Array.from(tubes).filter(tube => !tube.classList.contains('small')).every(tube => {
            let colorsInTube = Array.from(tube.childNodes).map(node => node.style.backgroundColor);
            return new Set(colorsInTube).size === 1 && colorsInTube.length === 4;
        });
        if (won) {
            alert('Gratulacje! Wygrałeś!');
        }
    }

    undoButton.addEventListener('click', () => {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            lastMove.blocks.forEach(block => lastMove.from.appendChild(block));
        }
    });

    newGameButton.addEventListener('click', () => {
        fillTubes();
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
});
