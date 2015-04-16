/**
 * Created by jiengfei on 15-4-13.
 */
var Group = require('./Group');
var utils = require('./utils');
var tween = require('./tween');
function init() {
    var wvv = require('./wvv');
    var Stage = require('./Stage');
    var DrawRecorder = require('./DrawRecorder');

    var Element = require('./Element');
    var gdr = new DrawRecorder().beginPath().rect(0, 0, 50, 50).stroke().drawable(50, 50);
    //
    var shape1 = new Element(gdr);
    var shape2 = new Element(gdr);
    var shape3 = new Element(gdr);
    //utils.print(shape1);
    shape1.scale(0.5, 0.5);
    shape2.setTranslate(0, 50);
    shape3.rotate(120);

    var group = (new Group()).add(shape1).skipH(100).add(shape2).nextLine()
        .skipV(100).add(shape3);

    var stage = new Stage();
    wvv.setStage("demoCanvas", stage);
    stage.addGroup(group);
    wvv.gameLoop();
    //
    //tween.get(shape1).to({'tx': 200, 'ty': 200, 'scaleX:': 5}).ease(function (x) {
    //    return 1 - x * x;
    //}).duration(1000).start();
};

init();