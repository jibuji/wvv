/**
 * Created by jiengfei on 15-4-13.
 */
/**
 * Created by jiengfei on 15-3-23.
 */
var Group = require('./Group');
var utils = require('./utils');
function init() {
    var wvv = require('./wvv');
    var Stage = require('./Stage');
    var DrawRecorder = require('./DrawRecorder');

    var Element = require('./AElement');
    var gdr = new DrawRecorder().beginPath().rect(0, 0, 50, 50).stroke().drawable(50, 50);
    //
    var shape1 = new Element(gdr);
    var shape2 = new Element(gdr);
    var shape3 = new Element(gdr);
    //utils.print(shape1);
    shape1.scale(0.5, 0.5);
    shape2.translate(0, 50);
    shape3.rotate(120);
    //var group = new Group();
    //group.add(shape1);
    //group.skipH(100);
    //group.add(shape2);
    //group.nextLine();
    //group.skipV(100);
    //group.add(shape3);
    //var children = group;
    var children = (new Group()).add(shape1).skipH(100).add(shape2).nextLine()
        .skipV(100).add(shape3);

    //utils.print(shape3);
    //console.log("shape3=" + shape3+";shape3.tx="+shape3.tx);

    var stage = new Stage();
    console.log("main tx=" + stage.tx + ";ty=" + stage.ty);
    wvv.setStage("demoCanvas", stage);
    console.log("main 2 tx=" + stage.tx + ";ty=" + stage.ty);
    stage.addGroup(children);
    console.log("main 3 tx=" + stage.tx + ";ty=" + stage.ty);
    wvv.gameLoop();
    console.log("init done");
};

init();