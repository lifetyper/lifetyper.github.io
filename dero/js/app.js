$(document).ready(function () {
    if (window.location.protocol == "http:" && window.location.hostname != 'localhost') {
        window.location = document.URL.replace("http://", "https://");
    }
    $(window).scroll(function (i) {
        var scrollVar = $(window).scrollTop();
        $('#header_title').css({'opacity': (100 - scrollVar) / 100 + 2});
        if (scrollVar > 0) {
            $('#scroll_down_btn').addClass('hide');
        } else {
            $('#scroll_down_btn').removeClass('hide');
        }
    });
    $('#nav').click(function () {
    });
    $('#nav .mainmenu a').click(function (e) {
        e.preventDefault();
        var sectionid = $(this).attr('data-target').replace('!', '');
        if ($(sectionid).length) {
            $('html,body').animate({scrollTop: $(sectionid).offset().top}, 900);
            $('#toggle-btn').click();
        }
    });
    $('#circle-orbit-container .orbits').hover(function () {
        $('.lock_open').toggleClass('hidden');
        $('.lock_close').toggleClass('hidden');
    });
    $(window).mousemove(function (e) {
        if ($('#smartcontracts_cube').is(':hover')) {
            $('.cube').removeClass('initial');
            $('.cube').css('transform', 'rotateX(' + -e.pageY + 'deg)' + 'rotateY(' + e.pageX + 'deg)');
        } else {
            $('.cube').addClass('initial');
        }
    });
    $('#roadmap').parallax({imageSrc: './img/parallax2.jpg'});
    $('.fadeonload').appear({'force_process': true});
    $('.fadeonload').on('appear', function (e, $affected) {
        var time = 100;
        $affected.each(function () {
            if ($(this).attr('data-animation')) {
                $(this).addClass($(this).attr('data-animation')).removeClass('fadeonload');
            } else {
                $(this).addClass('fadeIn').removeClass('fadeonload');
            }
        })
    });
});

var canvas = document.querySelector('canvas');
var width = canvas.offsetWidth, height = canvas.offsetHeight;
var dotsAmount = 2300;
var colors = [new THREE.Color('#ffffff'), new THREE.Color('#4b4a47'), new THREE.Color('#fefdf9'), new THREE.Color('#e2e0d7'),];
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(width, height);
renderer.setClearColor(0x000000, 0);
var scene = new THREE.Scene();
var raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 20;
var camera = new THREE.PerspectiveCamera(55, width / height, 2, 400);
camera.position.set(0, 0, 300);
camera.enableDamping = true;
camera.minPolarAngle = 0.8;
camera.maxPolarAngle = 2.4;
camera.dampingFactor = 0.07;
camera.rotateSpeed = 0.07;
var galaxy = new THREE.Group();
scene.add(galaxy);
var loader = new THREE.TextureLoader();
loader.crossOrigin = null;
var dotTexture = loader.load(window.location.href + "/img/dotTexture.png");
var dotsGeometry = new THREE.Geometry();
var positions = new Float32Array(dotsAmount * 3);
var sizes = new Float32Array(dotsAmount);
var colorsAttribute = new Float32Array(dotsAmount * 3);
for (var i = 0; i < dotsAmount; i++) {
    var vector = new THREE.Vector3();
    vector.color = Math.floor(Math.random() * colors.length);
    vector.theta = Math.random() * Math.PI * 2;
    vector.phi = (1 - Math.sqrt(Math.random())) * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
    vector.x = Math.cos(vector.theta) * Math.cos(vector.phi);
    vector.y = Math.sin(vector.phi);
    vector.z = Math.sin(vector.theta) * Math.cos(vector.phi);
    vector.multiplyScalar(110 + (Math.random() - 0.5) * 5);
    vector.scaleX = 6;
    if (Math.random() > 0.5) {
        moveDot(vector, i);
    }
    dotsGeometry.vertices.push(vector);
    vector.toArray(positions, i * 3);
    colors[vector.color].toArray(colorsAttribute, i * 3);
    sizes[i] = 5;
}

function moveDot(vector, index) {
    var tempVector = vector.clone();
    tempVector.multiplyScalar((Math.random() - 0.5) * 0.3 + 1);
    TweenMax.to(vector, Math.random() * 3 + 3, {
        x: tempVector.x,
        y: tempVector.y,
        z: tempVector.z,
        yoyo: true,
        repeat: -1,
        delay: -Math.random() * 3,
        ease: Power0.easeNone,
        onUpdate: function () {
            attributePositions.array[index * 3] = vector.x;
            attributePositions.array[index * 3 + 1] = vector.y;
            attributePositions.array[index * 3 + 2] = vector.z;
        }
    });
}

var bufferWrapGeom = new THREE.BufferGeometry();
var attributePositions = new THREE.BufferAttribute(positions, 3);
bufferWrapGeom.addAttribute('position', attributePositions);
var attributeSizes = new THREE.BufferAttribute(sizes, 1);
bufferWrapGeom.addAttribute('size', attributeSizes);
var attributeColors = new THREE.BufferAttribute(colorsAttribute, 3);
bufferWrapGeom.addAttribute('color', attributeColors);
var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {texture: {value: dotTexture}},
    vertexShader: document.getElementById("wrapVertexShader").textContent,
    fragmentShader: document.getElementById("wrapFragmentShader").textContent,
    transparent: true
});
var wrap = new THREE.Points(bufferWrapGeom, shaderMaterial);
scene.add(wrap);
var segmentsGeom = new THREE.Geometry();
var segmentsMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    vertexColors: THREE.VertexColors
});
for (i = dotsGeometry.vertices.length - 1; i >= 0; i--) {
    vector = dotsGeometry.vertices[i];
    for (var j = dotsGeometry.vertices.length - 1; j >= 0; j--) {
        if (i !== j && vector.distanceTo(dotsGeometry.vertices[j]) < 12) {
            segmentsGeom.vertices.push(vector);
            segmentsGeom.vertices.push(dotsGeometry.vertices[j]);
            segmentsGeom.colors.push(colors[vector.color]);
            segmentsGeom.colors.push(colors[vector.color]);
        }
    }
}
var segments = new THREE.LineSegments(segmentsGeom, segmentsMat);
galaxy.add(segments);
var hovered = [];
var prevHovered = [];

function render(a) {
    var i;
    dotsGeometry.verticesNeedUpdate = true;
    segmentsGeom.verticesNeedUpdate = true;
    raycaster.setFromCamera(mouse, camera);
    var intersections = raycaster.intersectObjects([wrap]);
    hovered = [];
    if (intersections.length) {
        for (i = 0; i < intersections.length; i++) {
            var index = intersections[i].index;
            hovered.push(index);
            if (prevHovered.indexOf(index) === -1) {
                onDotHover(index);
            }
        }
    }
    for (i = 0; i < prevHovered.length; i++) {
        if (hovered.indexOf(prevHovered[i]) === -1) {
            mouseOut(prevHovered[i]);
        }
    }
    prevHovered = hovered.slice(0);
    attributeSizes.needsUpdate = true;
    attributePositions.needsUpdate = true;
    renderer.render(scene, camera);
}

function onDotHover(index) {
    dotsGeometry.vertices[index].tl = new TimelineMax();
    dotsGeometry.vertices[index].tl.to(dotsGeometry.vertices[index], 1, {
        scaleX: 7,
        ease: Elastic.easeOut.config(4, 0.6),
        onUpdate: function () {
            attributeSizes.array[index] = dotsGeometry.vertices[index].scaleX;
        }
    });
}

function mouseOut(index) {
    dotsGeometry.vertices[index].tl.to(dotsGeometry.vertices[index], 0.4, {
        scaleX: 5,
        ease: Power2.easeOut,
        onUpdate: function () {
            attributeSizes.array[index] = dotsGeometry.vertices[index].scaleX;
        }
    });
}

function onResize() {
    canvas.style.width = '';
    canvas.style.height = '';
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

var mouse = new THREE.Vector2(-100, -100);
var angle = 0;
var radius = 0.5;
var rotSpeed = 1;
var x = camera.position.x, y = camera.position.y, z = camera.position.z;
var enterX;

function onMouseEnter(e) {
    enterX = e.clientX;
}

var scrollArea = window.innerHeight;

function onMouseMove(e) {
    var canvasBounding = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - canvasBounding.left) / width) * 2 - 1;
    mouse.y = -((e.clientY - canvasBounding.top) / height) * 2 + 1;
    last_post = e.clientX;
    var scrollTop = window.pageYOffset || window.scrollTop;
    if (e.clientY < scrollArea) {
        camera.position.z = z * Math.cos(e.clientY / -3000) - y * Math.sin(rotSpeed);
        camera.lookAt(scene.position);
    }
}

function onScroll() {
    var canvasBounding = canvas.getBoundingClientRect();
    var scrollTop = window.pageYOffset || window.scrollTop;
    var scrollPercent = scrollTop / scrollArea || 0;
    if (scrollTop > 5 && scrollTop < scrollArea) {
        camera.position.y = (scrollTop / 2);
        camera.lookAt(scene.position);
    } else {
        camera.position.y = y;
        camera.lookAt(scene.position);
    }
}

function onMouseOut() {
}

TweenMax.ticker.addEventListener("tick", render);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseover", onMouseEnter);
window.addEventListener("mouseout", onMouseOut);
window.addEventListener("scroll", onScroll);
var resizeTm;
window.addEventListener("resize", function () {
    resizeTm = clearTimeout(resizeTm);
    resizeTm = setTimeout(onResize, 200);
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var TextScramble = function () {
    function TextScramble(el) {
        _classCallCheck(this, TextScramble);
        this.el = el;
        this.chars = '!<>-@_\/[#]{}*^__~__~_';
        this.update = this.update.bind(this);
    }

    _createClass(TextScramble, [{
        key: 'setText', value: function setText(newText) {
            var _this = this;
            var oldText = this.el.innerText;
            var length = Math.max(oldText.length, newText.length);
            var promise = new Promise(function (resolve) {
                return _this.resolve = resolve;
            });
            this.queue = [];
            for (var i = 0; i < length; i++) {
                var from = oldText[i] || '';
                var to = newText[i] || '';
                var start = Math.floor(Math.random() * 40);
                var end = start + Math.floor(Math.random() * 40);
                this.queue.push({from: from, to: to, start: start, end: end});
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
    }, {
        key: 'update', value: function update() {
            var output = '';
            var complete = 0;
            for (var i = 0, n = this.queue.length; i < n; i++) {
                var _queue$i = this.queue[i], from = _queue$i.from, to = _queue$i.to, start = _queue$i.start,
                    end = _queue$i.end, char = _queue$i.char;
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.001) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += '<span class="dud">' + char + '</span>';
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
    }, {
        key: 'randomChar', value: function randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }]);
    return TextScramble;
}();
statemens = $('#intro_statements span').map(function () {
    return $(this).text();
}).get();
var phrases = statemens;
var el = document.querySelector('#changing_text .text');
var fx = new TextScramble(el);
var counter = 0;
var next = function next() {
    fx.setText(phrases[counter]).then(function () {
        setTimeout(next, 2100);
    });
    counter = (counter + 1) % phrases.length;
};
next();