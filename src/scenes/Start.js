export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/backgrounds/background_day.png');
        this.load.image('title', 'assets/backgrounds/title_text.png');
    }

    create() {
    
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Load Background image
        this.bg = this.add.tileSprite(0, 0, 0, 0, 'background').setOrigin(0);
        const scale = {height: height/this.bg.height, width: width/this.bg.width}

        // Load Title screen text
        this.title = this.add.tileSprite(640, 360, 0, 0, 'title').setInteractive({useHandCursor:true});

 
        this.bg.setScale(scale.width, scale.height)

        this.title.on('pointerup', () =>
        {
            this.scene.start('Battleground')
        });
    }

    update() {

  }
}