var $planPainter = document.getElementById('planPainter'),
    $svg = $planPainter.querySelector('svg'),
    polyline = null,
    svg = new Svg

    Polygon.count = 1
    
function Svg()
{
    this.clear = function(){
        this.removeElements(['polyline', 'rect'])
        polyline = null
    }

    this.pointClick = function(e){   
        var svgWidth = $planPainter.querySelector('svg').viewBox.baseVal.width,
            imgWidth = $planPainter.querySelector('img').width,
            ratio = svgWidth / imgWidth,
            x = Math.round((e.clientX - $svg.getBoundingClientRect().left) * ratio),
            y = Math.round((e.clientY - $svg.getBoundingClientRect().top) * ratio)
    
        return [x, y]
    }

    this.removeElements = function(selectorArray){
        for(var j = 0; j < selectorArray.length; j++){
            var elements = $planPainter.querySelectorAll(selectorArray[j]);
            for (var i = 0; i < elements.length; i++) { 
                elements[i].remove()
            }
        }
    }
}

function Rect(x, y)
{
    this.x = x
    this.y = y
    this.size = 22
    
    this.getСenterX = function(){
        return this.x - this.size / 2
    }
    this.getCenterY = function(){
        return this.y - this.size / 2
    }

    this.create = function(){

        var el = document.createElementNS('http://www.w3.org/2000/svg', "rect")

        //one rect id="rectOne"
        if(!$planPainter.querySelector('rect')){
            el.setAttributeNS(null, 'id', "rectOne")
        }

        el.setAttributeNS(null, 'x', this.getСenterX())
        el.setAttributeNS(null, 'y', this.getCenterY())
        el.setAttributeNS(null, 'width', this.size)
        el.setAttributeNS(null, 'height', this.size)

        $svg.appendChild(el)
    }
}

function Poly()
{
    this.getCoords = function(){
        var str = ''
        for(var i = 0; i < this.points.length; i++){
            str += this.points[i].x + ',' + this.points[i].y + ' '
        }
        return str
    }

    this.create = function(){

        var el = document.createElementNS('http://www.w3.org/2000/svg', this.type)

        el.setAttributeNS(null, 'points', this.getCoords())
    
        if(this.type == 'polygon'){

            this.printArea()

            el.setAttributeNS(null, 'class', 'area' + this.id)

            svg.clear()
        }

        $svg.appendChild(el)
    }
}

function Polyline()
{
    this.points = []

    Poly.call(this)

    this.type = 'polyline'

    this.update = function(x, y){

        this.points.push({x: x, y: y})

        $planPainter.querySelector(this.type).setAttributeNS(null, 'points', this.getCoords())

    }
}

function Polygon(points)
{
    this.points = points
    this.id = Polygon.count++
    this.type = 'polygon'

    Poly.call(this)   

    this.center = function(){
         
        var pts = this.points,
            nPts = pts.length,
            x=0, 
            y=0,
            f,
            j=nPts-1,
            p1, 
            p2
        
        for (var i=0;i<nPts;j=i++) {
            p1=pts[i]; p2=pts[j];
            f=p1.x*p2.y-p2.x*p1.y;
            x+=(p1.x+p2.x)*f;
            y+=(p1.y+p2.y)*f;
        }
        
        f=this.area()*6;
            
        return [Math.abs(x/f).toFixed(), Math.abs(y/f).toFixed()];
                  
    }

    this.area = function(){
    
        var total = 0;

        for (var i = 0; i < this.points.length; i++) {
            var addX = this.points[i].x;
            var addY = this.points[i == this.points.length - 1 ? 0 : i + 1].y;
            var subX = this.points[i == this.points.length - 1 ? 0 : i + 1].x;
            var subY = this.points[i].y;
    
            total += (addX * addY * 0.5);
            total -= (subX * subY * 0.5);
        }
    
        return Math.abs(total);
    }

    this.printArea = function(){

        var squareMeter = (this.area() / 15600).toFixed(1),
            className = 'area' + this.id

        new Text(
            squareMeter + ' кв.м.', 
            this.center()[0], 
            this.center()[1], 
            className
        ).create()
        
        new Button(
            'Комната ' + squareMeter + ' кв.м.',
            className
        ).create()
    }
}

function Text(title, x, y, className)
{
    this.create = function(){

        var el = document.createElementNS('http://www.w3.org/2000/svg', 'text')

        el.textContent = title;

        el.setAttributeNS(null, 'x', x - 40)

        el.setAttributeNS(null, 'y', y)

        el.setAttributeNS(null, 'class', className)
        
        $svg.appendChild(el)
    }
}

function Button(title, className)
{
    this.title = title
    this.className = className

    this.create = function(){
        var btn = document.createElement('button')

            btn.textContent = title

            btn.setAttribute('class', className)

            btn.setAttribute('title', 'Нажмите для удаления')

            btn.addEventListener('mouseover', function(e){

                var poly = $planPainter.querySelector('polygon.' + className)

                if(poly) poly.classList.add('hover')

            })

            btn.addEventListener('mouseout', function(e){

                var poly = $planPainter.querySelector('polygon.' + className)
                
                if(poly) poly.classList.remove('hover')
            
            })

            btn.addEventListener('click', function(e){
                
                var poly = $planPainter.querySelector('polygon.' + className)
                var text = $planPainter.querySelector('text.' + className)

                if(poly) 
                    poly.remove()
                    text.remove()
                    this.remove() 
            })

        $planPainter.querySelector('.rooms').appendChild(btn)
    }
}

/*EVENT*/

$svg.addEventListener('click', function(e){

    var x = svg.pointClick(e)[0],
        y = svg.pointClick(e)[1]

    //rectOne the first element rect
    if(e.target.id !== "rectOne"){

        if(polyline === null){
            
            polyline = new Polyline()
            polyline.create()

        }

        polyline.update(x, y)
        
        new Rect(x, y).create()       

    }else{

        new Polygon(polyline.points).create()

    }

})

document.addEventListener("keydown", function(event) {
    if (event.keyCode == 27) //Esc
        svg.clear()
});

// Create Element.remove() function if not exist
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this)
        }
    }
}