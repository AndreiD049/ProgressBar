/*
    Scoreboard for my personal project (actually for my day-job)
*/

// Defining aliases
let Application     = PIXI.Application,
    Sprite          = PIXI.Sprite,
    AnimatedSprite  = PIXI.extras.AnimatedSprite,
    loader          = PIXI.loader,
    resources       = PIXI.loader.resources;


// Application class
class ScoreBoard 
{
    constructor(teams, w, h, max_points)
    {
        this.team_class = TeamRabbit;
        this.app = new Application();
        this.app.stage.sortableChildren = true;     //TEST
        this.max_score = max_points;
        this.start_x = 0;
        this.finish_x = 0;
        this.offset = 100;
        this.load_assets(teams, w, h);
    };

    // Based on the parameters configures app width & height
    // teams is an object containing all the teams
    configure(width, height)
    {
        // use the width passed by the user 
        // but check the height, each team should have at least 200 px of space
        this.width = width
        let len = Object.keys(this.teams).length;
        if (len * 200 > height)
        {
            this.height = len * 200 + 100;
        }
        else 
        {
            this.height = height;
        }

        this.app.renderer.autoResize = true;
        this.app.renderer.resize(this.width, this.height);
    };

    // Attaches app to the DOM
    attach(element)
    {
        if (this.app)
        {
            element.appendChild(this.app.view);
        } 
        else
        {
            throw ReferenceError("You should initialize the app first.");
        }
    };

    // method that initializes teams based on the passed object
    init_teams(teams)
    {
        this.teams = {};
        // insert each team object in the teams array
        Object.keys(teams).forEach((team_name, idx) => 
            {
                // this.teams.push(new this.team_class(this, team_name, teams[team_name], idx));
                this.teams[team_name] = new this.team_class(this, team_name, teams[team_name], idx);
            });
    };

    // Loads all the images
    load_assets(teams, width, height)
    {
        loader.add([{name: "start", url: start},
                    {name: "finish", url: finish},
                    {name: "rabbit", url: bunnies}])
                .on("progress", this.load_progress_report)
                .load(this.start.bind(this, teams, width, height));
    };

    load_progress_report(loader, resource)
    {
        console.log(`[${loader.progress}%] Loading finished: ${resource.url}`);
    };

    start(teams, w, h)
    {
        this.init_teams(teams);
        this.configure(w, h);
        this.init_background();
        this.render_teams();
        this.app.ticker.add(this.gameloop.bind(this));
    };

    // Initialises the background color and draws the start and finish lines
    init_background()
    {
        this.app.renderer.backgroundColor = 0x000000;
        
        let start = new Sprite(resources["start"].texture);
        let finish = new Sprite(resources["finish"].texture);

        // the percentage to which the width and height of the sprite should grow/shrink
        // is a number between 0 and 1 (ex 0.6)
        let percentage = this.height / start.width;

        // position the start line
        start.width *= percentage;
        start.height = (this.width * 0.2) > (start.height * percentage) ? start.height * percentage : this.width * 0.2;
        start.position.set(start.height + this.offset, 0);
        start.anchor.set(1, 1);
        start.rotation = -90 * PIXI.DEG_TO_RAD;
        // make it red
        start.tint = 0xff5555;

        // position the finish line
        finish.width *= percentage;
        finish.height = (this.width * 0.2) > (finish.height * percentage) ? finish.height * percentage : this.width * 0.2;
        finish.position.set(this.width - finish.height - this.offset, 0);
        finish.anchor.set(0, 1);
        finish.rotation = 90 * PIXI.DEG_TO_RAD;
        finish.tint = 0xff5555;

        this.start_x = start.position.x - start.height / 2;
        this.finish_x = finish.position.x + finish.height;

        this.app.stage.addChild(start);
        this.app.stage.addChild(finish);
    };

    render_teams()
    {
        Object.keys(this.teams).forEach(team => 
            {
                this.teams[team].position();
                this.teams[team].render();
            });
    };

    // Updates the teams from object
    update_from_object(obj)
    {
        Object.keys(obj).forEach((team, idx) => {
            if (this.teams.hasOwnProperty(team))
            {
                setTimeout(this.teams[team].update_score.bind(this.teams[team], obj[team]), Utils.random_int(0, 2000));
            }
        }, this);
    }

    gameloop()
    {
        Object.keys(this.teams).forEach(team => {
            this.teams[team].move();
            this.teams[team].random_emotion();
        })
    };
};

class Team
{
    constructor(app, name, score, index)
    {
        this.app = app;
        this.name = name;
        this.score = score;
        this.index = index;
        this.target_x = 0;
        this.displayed_score = this.score;
        this.locked = 0;
        this.animation = "idle"
        this.sprite = null; 
        this.text_sprite = new TextWithBackground(`"${this.name}": ${this.displayed_score}`, this.text_style);
    };

};

class TeamRabbit extends Team
{
    constructor(app, name, score, index, color)
    {
        super(app, name, score, index);
        this.init_sprite();
        this.sprite.tint = color || 0xffffff; // color should be a hexadecimal number
    }

    init_sprite()
    {
        this.sprite = new AnimatedSprite(
            this.animations[this.animation]["tiles"].map(tx_name => 
                {
                    return resources["rabbit"].textures[tx_name];
                })
        );

        this.sprite.animationSpeed = 0.120;
        this.sprite.loop = this.animations[this.animation]["loop"];
        this.sprite.play()
        // set the anchor to the left bottom of the sprite
        this.sprite.anchor.set(0, 1);
        this.text_sprite.anchor.set(0.5, 0.5);
        Utils.resize_sprite(this.sprite, 0, 150);
        this.turn();
        this.turn();
    };

    change_animation(animation)
    {
        if (!this.sprite.playing || animation == "run")
        {
            this.sprite.onComplete = null;
            this.animation = animation;
            this.sprite.textures = this.animations[animation]["tiles"].map(tx_name => { return resources["rabbit"].textures[tx_name] });
            this.sprite.loop = this.animations[animation]["loop"];
            this.sprite.play();
        }
        else
        {
            if (!this.sprite.loop)
            {
                this.sprite.onComplete = function(){ this.change_animation(animation) }.bind(this);
            }
        }
    }

    position()
    {
        let total_teams = Object.keys(this.app.teams).length;
        let total_height = total_teams * 200;

        // check if the height of the app is bigger than the on we need
        if (this.app.height < total_height) 
        {
            throw Error("The application height is too small for this amount of teams");
        }

        // starting y point
        let start_y = this.app.height / 2 - total_height / 2;
        this.sprite.position.set(this.app.start_x, start_y + (this.index * 200) + this.sprite.height);
        this.target_x = this.sprite.position.x;
        // set the text right below the rabbit
        this.sync_text();
    }

    render()
    {
        this.app.app.stage.addChild(this.sprite);
        this.app.app.stage.addChild(this.text_sprite.box);
    }

    move()
    {
        let difference = Math.abs(this.target_x - this.sprite.x)
        let step = difference > this.speed ? this.speed : difference;

        if (this.sprite.x < this.target_x)
        {
            if (this.sprite.scale.x > 0)
            {
                this.turn()
            }
            else
            {
                if (this.animation != "run") this.change_animation("run");
                this.sprite.x += step;
                this.sync_text();
            }
            this.update_displayed_score();
        }
        else if (this.sprite.x > this.target_x)
        {
            if (this.sprite.scale.x < 0)
            {
                this.turn();
            }
            else
            {
                if (this.animation != "run") this.change_animation("run");
                this.sprite.x -= step;
                this.sync_text()
            }
            this.update_displayed_score();
        }
        else
        {
            if (this.animation == "run")
            {
                this.sprite.stop();
                this.change_animation("idle");
                if (this.sprite.scale.x > 0) this.turn();
            }
        }
    };

    turn()
    {
        this.sprite.scale.set(this.sprite.scale.x * -1, this.sprite.scale.y);
        this.sprite.anchor.x = this.sprite.scale.x < 0 ? 0: 1;
        this.sync_text()
    }

    sync_text()
    {
            this.text_sprite.position.set(this.sprite.x - this.sprite.width / 2, this.sprite.y + 5);
    };

    update_displayed_score()
    {
        if (this.sprite.x != this.target_x)
        {
            let score_difference = this.score - this.displayed_score;
            let x_difference = Math.abs(this.target_x - this.sprite.x);
            let steps_left = Math.floor(x_difference / this.speed);
            if (steps_left != 0)
            {
                this.displayed_score += score_difference / steps_left;
            }
            this.text_sprite.update_text(`"${this.name}": ${Math.floor(this.displayed_score)}`)
        }
    };

    update_score(new_score)
    {
        this.score = new_score;
        let percentage = new_score / this.app.max_score;
        this.target_x = this.app.start_x + (this.app.finish_x - this.app.start_x) * percentage;
    };

    random_emotion()
    {
        let variants = ["stoop", "straighten"];

        if (this.locked == 0)
        {
            this.locked = setTimeout(function(){ 
                this.change_animation(variants[Utils.random_int(0, 1)]);
                this.locked = 0;
            }.bind(this), Utils.random_int(2000, 20000));
        }
    }
};

// define a class variable. Rewrite in case it can be done more concise
TeamRabbit.prototype.animations = {
        "idle":     {
                        "tiles": ["tile000.png"],
                        "loop": false
                    },
                    
        "stoop":    {
                        "tiles": ["tile000.png",
                                "tile001.png",
                                "tile002.png",
                                "tile003.png",
                                "tile004.png",
                                "tile005.png",
                                "tile006.png",
                                "tile007.png",
                                "tile006.png",
                                "tile007.png",
                                "tile006.png",
                                "tile007.png",
                                "tile006.png",
                                "tile007.png",
                                "tile006.png",
                                "tile005.png",
                                "tile004.png",
                                "tile003.png",
                                "tile002.png",
                                "tile001.png",
                                "tile000.png"],
                        "loop": false
                    },

        "run":      {
                        "tiles": ["tile013.png",
                                "tile008.png",
                                "tile009.png",
                                "tile010.png",
                                "tile011.png",
                                "tile012.png"],
                        "loop": true
                    },

    "straighten":   {
                        "tiles": ["tile017.png",
                                "tile018.png",
                                "tile019.png",
                                "tile020.png",
                                "tile021.png",
                                "tile022.png",
                                "tile022.png",
                                "tile022.png",
                                "tile022.png",
                                "tile022.png",
                                "tile022.png",
                                "tile021.png",
                                "tile020.png",
                                "tile020.png",
                                "tile020.png",
                                "tile020.png",
                                "tile020.png",
                                "tile020.png",
                                "tile019.png",
                                "tile018.png",
                                "tile017.png"],
                        "loop": false
                    }
};

TeamRabbit.prototype.text_style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 30
});

TeamRabbit.prototype.speed = 6;


class TextWithBackground
{
    constructor(text, style)
    {
        this.text = new PIXI.Text(text, style)
        this.txtBG = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.autoresize();
        this.box = new PIXI.Container();

        this.box.addChild(this.txtBG, this.text);

        this.box.name = "textSprite";

        this.position = {
            "set": function(x, y) {
                this.text.position.set(x, y);
                this.txtBG.position.set(x, y);
            }.bind(this)
        }

        this.anchor = {
            "set": function(x, y) {
                this.text.anchor.set(x, y);
                this.txtBG.anchor.set(x, y);
            }.bind(this)
        }
    };

    update_text(new_text)
    {
        this.text.text = new_text;
        this.autoresize();
    };

    autoresize()
    {
        this.txtBG.width = this.text.width * 1.2;
        this.txtBG.height = this.text.height * 1.1;
    }
}


// Util functions
class Utils
{
    static resize_sprite(sprite, width, height)
    {
        let percentage;
        if (width != 0 && height != 0)
        {
            throw Error("Specify either desired width or height. ");
        }
        else if (width != 0)
        {
            percentage = width / sprite.width;
        }
        else
        {
            percentage = height / sprite.height;
        }

        // sprite.scale.set(percentage);
        sprite.width *= percentage;
        sprite.height *= percentage;
    };

    static random_int(min, max)
    {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }
}


// TEST

app = new ScoreBoard(
    {
        "Team 1": 0,
        "Team 2": 0,
        "Team 3": 0,
        "Team 4": 0
    },
    2000,
    500,
    100
);

el = document.getElementById("canv")
app.attach(el);