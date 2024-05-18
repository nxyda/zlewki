document.addEventListener('DOMContentLoaded', () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
    const tubes = document.querySelectorAll('.test-tube');
    const undoButton = document.getElementById('undo-button');
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
        if (currentSelection && currentSelection.color !== colorDiv) {
            const targetTubeCapacity = tube.classList.contains('small') ? 2 : 4;
            const targetTubeEmpty = tube.childNodes.length < targetTubeCapacity;
            const sameColor = currentSelection.color.style.backgroundColor === colorDiv.style.backgroundColor;
            if (targetTubeEmpty && (sameColor || tube.childNodes.length === 0)) {
                moveHistory.push({ from: currentSelection.tube, to: tube, block: currentSelection.color });
                tube.appendChild(currentSelection.color);
                currentSelection.color.style.border = '';
                currentSelection = null;
                checkWin();
            } else {
                currentSelection.color.style.border = '';
                currentSelection = null;
            }
        } else {
            if (tube.childNodes.length > 0) {
                currentSelection = { tube, color: colorDiv };
                colorDiv.style.border = '2px solid black';
            }
        }
    }

    function checkWin() {
        let won = Array.from(tubes).every(tube => {
            let colorsInTube = Array.from(tube.childNodes).map(node => node.style.backgroundColor);
            return new Set(colorsInTube).size <= 1;
        });
        if (won) {
            alert('Gratulacje! Wygrałeś!');
        }
    }

    undoButton.addEventListener('click', () => {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            lastMove.from.appendChild(lastMove.block);
        }
    });

    tubes.forEach(tube => {
        tube.addEventListener('click', event => {
            if (event.target.classList.contains('color')) {
                selectColor(tube, event.target);
            } else if (tube === event.target && currentSelection) {
                const targetTubeCapacity = tube.classList.contains('small') ? 2 : 4;
                if (tube.childNodes.length < targetTubeCapacity) {
                    moveHistory.push({ from: currentSelection.tube, to: tube, block: currentSelection.color });
                    tube.appendChild(currentSelection.color);
                    currentSelection.color.style.border = '';
                    currentSelection = null;
                    checkWin();
                }
            }
        });
    });

    fillTubes();
});
