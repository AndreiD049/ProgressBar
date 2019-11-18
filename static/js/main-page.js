$(document).ready(function()
{
    let colors = document.querySelectorAll(".colorinput");
    colors.forEach(color => {
        let picker = new CP(color);
        color.addEventListener("click", function(evt) {
            evt.preventDefault();
        });

        picker.on("change", function(color) {
            this.source.value = "#" + color;
        });
    })
});

let addteam = document.getElementById("addteam");
addteam.addEventListener("click", function(evt) {
    let next_team = $("div.team").length + 1;
    let pattern = `
    <div class="form-group text-center team">
        <label for="roundName center">Team ${next_team}:</label>
        <input type="text" class="form-control" name="team${next_team}" id="team${next_team}">
        <input type="color" name="color-team${next_team}" class="colorinput mt-2">
    </div>`
    $("div.team").last().after(pattern);
    let inp = $("input.colorinput").last().get(0);
    // set the color picker events
    let picker = new CP(inp);
    inp.addEventListener("click", function(evt) {
        evt.preventDefault();
    });

    picker.on("change", function(color) {
        this.source.value = "#" + color;
    })
})