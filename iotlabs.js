// (c) Copyright 2015 iotlabs.us, All Rights Reserved

// tunables
var company_name      = "IOT LABS"
var FadeOutTime       = 300;
var FadeInTime        = 300;
var MouseQuiesce      = 200;
var LogoDeadSpaceAnimationRedrawTime = 5;
var ShowInfoBox      = false;   // set true to show small time infobox

// order matters in these -- see _draw_panel()
const HIT_PANEL_POP_UP  = -1;
const HIT_COMPANY_NAME  = -2;
const HIT_NONE          = -3;
const HIT_DOC           = -4;

var LastMouseHitTime = 0;

var ArcCanvas = null;
var CenterTextCanvas = null;    // see: http://stackoverflow.com/questions/18431332/delete-only-text-but-not-the-image-using-canvas
var LastRotation = Math.random()*360;
var arcs = [];

var MenuBarHeight           = 0;
var arc_canavs_name         = "arc_canvas";
var center_text_canvas_name = "center_canvas";
var canvasOffset            = null;
var offsetX                 = null;
var offsetY                 = null;
var ctx                     = null;

var IsisPointInStrokeSupported = true;
 

// for some reason, these tables are out of sync due to arc rotation...

function DegreesToRadians( degs )
{ "use strict";
  return ((2*Math.PI) / 360) * degs;
}

function defineArc(arc)
{ "use strict";
    ctx.beginPath();
    // console.log(arc.cx, arc.cy, arc.radius, arc.start, arc.end);
    ctx.arc(arc.cx, arc.cy, arc.radius, arc.start, arc.end);
    ctx.lineWidth = arc.line_width;
}

function CreateCanvas(CanvasName, CanvasDimX, CanvasDimY, Z, DrawBorder)
{ "use strict";
  var Canvas = document.createElement("canvas");
  Canvas.width  = CanvasDimX;
  Canvas.height = CanvasDimY;
  Canvas.id     = CanvasName;
  Canvas.style.left = ((window.innerWidth -Canvas.width )/2).toString()+"px";
  Canvas.style.top  = ((window.innerHeight-Canvas.height)/2).toString()+"px";
  Canvas.style.position = "absolute";
  Canvas.style.zIndex   = Z;
  if (DrawBorder == true)
  {
    Canvas.style.border   = "1px solid #f00"; 
  }
  document.body.appendChild(Canvas);
  return Canvas;
}

function DrawLogo()
{ "use strict";
  _DrawLogo(1);
}

function _DrawLogo(RotateDegreesPerChange)
{ "use strict";
  // if canvas already present, remove it and re-create
  if (ArcCanvas != null)
  {
    document.body.removeChild(ArcCanvas);
    document.body.removeChild(CenterTextCanvas);
  }

  var CanvasDim         = Math.min(window.innerWidth,  window.innerHeight ) / 1.2; 
  var CenterCanvasDim   = CanvasDim / 2.2; 
  var DrawBorder        = false;
  ArcCanvas        = CreateCanvas( arc_canavs_name, CanvasDim, CanvasDim, -2, DrawBorder );
  CenterTextCanvas = CreateCanvas( center_text_canvas_name, CenterCanvasDim, CenterCanvasDim/4, -1, DrawBorder );

  ctx = ArcCanvas.getContext("2d");

  ctx.save();
  var radius = Translate();

  // fill center
  radius = radius * 0.90
  ctx.beginPath();
  // ctx.arc(0, 0, radius*.85, 0, 2*Math.PI);
  ctx.arc(0, 0, radius, 0, 2*Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();


  var NumSectors = panel_content.length;
  var ArcWidth   = 2*Math.PI/NumSectors;
  var FirstAngle = DegreesToRadians(LastRotation) % (2*Math.PI);
  var StartAngle = FirstAngle;
  var EndAngle   = StartAngle + ArcWidth;

  LastRotation += RotateDegreesPerChange;

  
  // define the arcs but don't draw
  arcs = [];

  var arc_rad = radius * .80;
  for( var i = 0; i < NumSectors; ++i)
  {
    arcs.push( 
      { 
        cx:                 0, 
        cy:                 0, 
        radius:             arc_rad, 
        start:              StartAngle, 
        end:                EndAngle-0.02, // for gap: EndAngle-0.02, for no gap in arcs: EndAngle+.01, 

        grad_x_start:       0,
        grad_y_start:       0,
        grad_x_end:         0,
        grad_y_end:         0,

        grad_rad_start:     arc_rad*0.63,      
        grad_rad_end:       arc_rad*1.47,      
                                              
        color_stop_1_stop:  0.00,             
        color_stop_2_stop:  0.45,             
        color_stop_3_stop:  0.55,             
        color_stop_4_stop:  0.95,             
                                              
        color_stop_1_color: "#000",           
        color_stop_2_color: panel_content[i].arc_color,    
        color_stop_3_color: panel_content[i].arc_color,    
        color_stop_4_color: "#000",           

        line_width:         arc_rad*.67,
        label_text:         panel_content[i].arc_label,
        label_color:        panel_content[i].arc_label_color,
      }
    );
    StartAngle += ArcWidth;
    EndAngle   += ArcWidth;
  }

  // draw the arcs
  for(var i=0;i<arcs.length;i++)
  {
    var arc = arcs[i];

    defineArc( arc );
    var grad = ctx.createRadialGradient(arc.grad_x_start, arc.grad_y_start, arc.grad_rad_start, arc.grad_x_end, arc.grad_y_end, arc.grad_rad_end ); // http://www.w3schools.com/tags/canvas_createradialgradient.asp
    grad.addColorStop(arc.color_stop_1_stop, arc.color_stop_1_color);         // http://www.w3schools.com/tags/canvas_addcolorstop.asp
    grad.addColorStop(arc.color_stop_2_stop, arc.color_stop_2_color);
    grad.addColorStop(arc.color_stop_3_stop, arc.color_stop_3_color);
    grad.addColorStop(arc.color_stop_4_stop, arc.color_stop_4_color);
    
    ctx.strokeStyle = grad;
    ctx.stroke();
  }

  ctx.restore();
  DrawText(ctx, FirstAngle, ArcWidth, NumSectors);

  // register mouse listeners
  $("#"+arc_canavs_name).mousemove(function(e){handleMouseMoveArc(e);});
  $("#"+center_text_canvas_name).mousemove(function(e){handleMouseMoveCenter(e);});
  $(".iot_test_panel").mousemove(function(e){handleMouseMovePanel(e);});
  $(document).mousemove(function(e){handleMouseMoveDoc(e);}); 

}

function DrawText(Context, FirstAngle, ArcWidth, NumSectors)
{ "use strict";
  DrawArcText(Context, FirstAngle, ArcWidth, NumSectors);
  DrawCompanyText(true);
}

var NextAlpha = 1.0;
var AlphaDeltaDelta = 0.01;       // rate of change
var AlphaDeltaDir = -AlphaDeltaDelta;  // current direction

function DrawCompanyText(Reset)
{ "use strict";

  var Context = CenterTextCanvas.getContext("2d");
  Context.globalAlpha = 1.0;
  Context.clearRect(0,0,CenterTextCanvas.width,CenterTextCanvas.height);

  if (Reset == true)
  {
    NextAlpha = 1.0;
    AlphaDeltaDir = -AlphaDeltaDelta;
  }
  else
  {
    NextAlpha += AlphaDeltaDir;
    if( AlphaDeltaDir > 0 )
    {
       if(NextAlpha > 1.0)
       {
         NextAlpha = 1.0;
         AlphaDeltaDir = -AlphaDeltaDelta;
       }
    }
    else 
    {
      if( NextAlpha < 0.3 )
      {
        NextAlpha = 0.3;
        AlphaDeltaDir = AlphaDeltaDelta;
      }
    }
  }
  // console.log(NewLogoTextSize, CoNamePulseDelta);


  function DrawIt(Context, Size, StrokeStyle, FillStyle)
  { "use strict";
    var LogoCenterX;
    var LogoCenterY;
    LogoCenterX       = CenterTextCanvas.width  / 2;
    LogoCenterY       = CenterTextCanvas.height / 2 + Size/2.3;

    var font_descriptor = '900 ' + Size.toString() + 'px Arial';
    Context.save();
    Context.globalAlpha = NextAlpha;

    Context.beginPath();
    Context.font = font_descriptor;
    Context.textAlign = 'center';
    Context.fillStyle = FillStyle;
    Context.strokeStyle = StrokeStyle;
    Context.lineWidth = 28;

    Context.fillText(company_name, LogoCenterX, LogoCenterY);
    Context.restore();
  }
  DrawIt( Context, CenterTextCanvas.width / 5.4, "#aaa", "#fff" );

}

function DrawArcText(Context, FirstAngle, ArcWidth, NumSectors)
{ "use strict";
  function GetLabelArcWidth( label_len, font_size, canvas_width, ArcWidth )
  { "use strict";
    // derived emprically and plugged into excel for slope and intercept
    var slope = 0.006581564;
    var intercept = 0.009379888;
    var y = slope * canvas_width + intercept;
    var label_arc_width = label_len/(font_size/y); 
    // console.log(label_arc_width);
    return label_arc_width;
  }
  var font_size = ArcCanvas.width / 18;
  var font_descriptor = '900 ' + font_size.toString() + 'px Arial';
  // console.log(font_descriptor);

  var StartAngle = FirstAngle+2*ArcWidth;   // sync labels and arcs: 2*ArcWidth is for some kind of rotation bug between arc draw and text draw...
  var EndAngle = StartAngle + ArcWidth;
  for( var i = 0; i < NumSectors; ++i)
  {
    var arc = arcs[i];
    var label_text = arc.label_text;
    var label_centerX = ArcCanvas.width / 2;
    var label_centerY = ArcCanvas.height / 2;
    var label_arc_width = GetLabelArcWidth( label_text.length, font_size, ArcCanvas.width, ArcWidth);

    // console.log( ArcCanvas.width, font_size, label_arc_width );
    // console.log("ArcWidth", ArcWidth);
    var letter_radius = ArcCanvas.width / (3.0);
    // var letter_radius = ArcCanvas.width / (3.2/ArcWidth);
    var label_left_offset = StartAngle - ((ArcWidth/2+label_arc_width)/2);   // position first character at center of arc - 1/2 width of text
    drawTextAlongArc(Context, label_text, label_centerX, label_centerY, letter_radius, label_arc_width, label_left_offset, font_descriptor, arc.label_color );
    StartAngle += ArcWidth;
    EndAngle   += ArcWidth;
  }
}

function drawTextAlongArc(context, str, centerX, centerY, letter_radius, label_arc_width, start_angle, font_descriptor, label_color) 
{ "use strict";
  context.save();
  context.beginPath();

  context.font = font_descriptor;
  context.textAlign = 'center';
  context.fillStyle = label_color;
  context.strokeStyle = '#aaa';
  context.lineWidth = 28;

  var len = str.length, s;
  context.translate(centerX, centerY);
  context.rotate(start_angle);
  context.rotate(-1 * (label_arc_width / len) / 1.6);
  for(var n = 0; n < len; n++) {
    context.rotate(label_arc_width / len);
    context.save();
    context.translate(0, -1 * letter_radius);
    s = str[n];
    context.fillText(s, 0, 0);
    context.restore();
  }
  context.restore();
}
function Translate()
{ "use strict";
  var radius = ArcCanvas.width / 2;
  ctx.translate(radius, radius);
  return radius;
}

var CurPanel = -1;
var last_timeout_id = -1;

var last_mouse_moved_id = -1;
function IsMouseMoving(func, NextPanel, X, Y)
{ "use strict";
  // console.log( "IsMouseMoving", NextPanel, X, Y);

  // each time mouse moves, we just wait.  Once mouse stops moving, we call the requested function
  clearTimeout( last_mouse_moved_id );
  last_mouse_moved_id = setTimeout(function()
  { "use strict";
    // console.log("last_mouse_moved", NextPanel, X, Y);
    func( NextPanel, X, Y );
  }, MouseQuiesce);

}

function best_panel_coords(X, Y, PanelWidth, PanelHeight)
{ "use strict";
  // given mouse x & y, determine bext place to draw new panel
  var PanelX;
  var PanelY;
  if( X < window.innerWidth/2 )
  {
    PanelX = X;
  }
  else
  {
    PanelX = X-PanelWidth;
  }
  if( Y < window.innerHeight/2 )
  {
    PanelY = Y;
  }
  else
  {
    PanelY = Y-PanelHeight;
  }
  return( [PanelX, PanelY] );
}
  // determine 

function draw_panel(NextPanel, X, Y, UpDelay)
{ "use strict";
  LastMouseHitTime = Date.now();
  IsMouseMoving( _draw_panel, NextPanel, X, Y-MenuBarHeight, UpDelay );
}

function _draw_panel(NextPanel, X, Y, UpDelay)
{ "use strict";
  UpDelay = (UpDelay == "undefined") ? FadeOutTime : UpDelay;
  // console.log( NextPanel, X, Y )

  //
  // Transitions possible:
  //  case    current     next    action(s)
  //  ----    -------     ----    ---------
  //   1       none   ->   X      fade-in X
  //   2        X     ->  none    fade-out X
  //   3        X     ->   Y      fade-out X, fade-in Y
  //   4        X     ->   X      fade-out X, fade-in X (panel moved)

  // case 4...
  if( NextPanel == HIT_PANEL_POP_UP )
  {
    return;
  }


  // case 2 & 3
  if( CurPanel >= HIT_PANEL_POP_UP )
  {
    // console.log("FADE-OUT");
    clearTimeout( last_timeout_id );
    $(".iot_test_panel").stop(true, true).fadeOut({"duration":UpDelay});
  }
  // case 2
  if( NextPanel < 0 )
  {
    return;
  }
  // case 1, 3
  
  clearTimeout( last_timeout_id );
  last_timeout_id = setTimeout(function()
  { "use strict";
    var height = panel_content[ NextPanel ].panel_height;
    var width = panel_content[ NextPanel ].panel_width;
    var font_size = ArcCanvas.width / 30;

    var best_panel_loc = best_panel_coords(X, Y, width, height)
    var left = best_panel_loc[0];
    var top  = best_panel_loc[1];

    var arc_color       = panel_content[NextPanel].arc_color;
    var arc_label_color = panel_content[NextPanel].arc_label_color;

    $(".iot_test_panel").css("width",               width);
    $(".iot_test_panel").css("margin-left",         left);
    $(".iot_test_panel").css("margin-top",          top);
    $(".iot_test_panel").css("height",              height );
    $(".iot_test_panel").css("background-color",    arc_color );

    $(".iot_panel_heading").css("font-size",            font_size );
    $(".iot_panel_heading").css("color",                arc_label_color );
    $(".iot_panel_heading").css("background-color",     arc_color );
    $(".iot_panel_heading").html(panel_content[ NextPanel ].panel_title);

    $(".iot_panel_body").css("height",        height-(24+font_size) );
    $(".iot_panel_body").css("border-color",  arc_color );     

    $(".iot_panel_content").html(panel_content[ NextPanel ].panel_content);

    // console.log("FADE-IN");
    $(".iot_test_panel").stop(true, true).fadeIn({"duration":FadeInTime});
    $(".iot_test_panel").css("display", "inline" );
  }, UpDelay+10);
}

function GetMouseHitInfo(e)
{ "use strict";

  var x = e.clientX, y = e.clientY;
  var elementMouseIsOver = document.elementFromPoint(x, y);
  var tag_class = $(elementMouseIsOver).attr('class');
  var tag_id = $(elementMouseIsOver).attr('id');
  var tag_name = $(elementMouseIsOver).get(0).tagName;
  var rc = 
  { 
    "x"                  : x                  ,
    "y"                  : y                  ,
    "elementMouseIsOver" : elementMouseIsOver ,
    "tag_class"          : tag_class          ,
    "tag_id"             : tag_id             ,
    "tag_name"           : tag_name           ,
  };
  return( rc );

}

var last_logo_redraw_timer_id;
var last_logo_redraw_in_process = false;
var LastMouseX = 0;
var LastMouseY = 0;

function handleMouseMoveDoc(e)
{ "use strict";

  // sadly, we get mouse move events for ALL mouse moves in the doc, regardless of what other
  // elements we have on top.  Using the below hacky code, we can determine if the element the mouse
  // is "over" is anything but the HTML doc -- if it's only the HTML doc, we know we can tear down the
  // panel, if it's up.
  if( GetMouseHitInfo( e ).tag_name == 'HTML' )
  {
    // console.log( "HTML Mouse Hit"  );
    draw_panel(HIT_DOC, e.clientX, e.clientY );
    // animate the logo as the mouse moves in the blank areas...
    // we animate clockwise and CCW based on direction of mouse move in X or Y
    if( last_logo_redraw_in_process === false )
    {
      last_logo_redraw_in_process = true;
      last_logo_redraw_timer_id = setTimeout(
      function()
      {
        var DeltaX = e.clientX - LastMouseX;
        var DeltaY = e.clientY - LastMouseY;
        LastMouseX = e.clientX;
        LastMouseY = e.clientY;
        var DeltaMove;
        if ( Math.abs( DeltaX ) > Math.abs(DeltaY) )
        {
          DeltaMove = ( DeltaX > 0 ) ? 1 : -1;
        }
        else
        {
          DeltaMove = (DeltaY > 0 ) ? 1 : -1;
        }

        _DrawLogo( DeltaMove );
        last_logo_redraw_in_process = false;
      }, LogoDeadSpaceAnimationRedrawTime );
    }
  }
}

function handleMouseMovePanel(e)
{ "use strict";
  // get canvas offset in window
  var canvasOffset=$(".iot_test_panel").offset();
  var offsetX=canvasOffset.left;
  var offsetY=canvasOffset.top;

  // get mouse position
  var mouseX=parseInt(e.clientX-offsetX);
  var mouseY=parseInt(e.clientY-offsetY);
  // console.log("panel", mouseX, mouseY );
  draw_panel(HIT_PANEL_POP_UP, e.clientX, e.clientY );

}

function handleMouseMoveCenter(e)
{ "use strict";
  // get canvas offset in window
  var canvasOffset=$("#"+center_text_canvas_name).offset();
  var offsetX=canvasOffset.left;
  var offsetY=canvasOffset.top;

  // get mouse position
  var mouseX=parseInt(e.clientX-offsetX);
  var mouseY=parseInt(e.clientY-offsetY);
  // console.log("center", mouseX, mouseY );
  draw_panel(HIT_COMPANY_NAME, e.clientX, e.clientY);

}
function handleMouseMoveArc(e)
{ "use strict";
  // console.log("arc", e.clientX, e.clientY );
  // get canvas offset in window
  var canvasOffset=$("#"+arc_canavs_name).offset();
  var offsetX=canvasOffset.left;
  var offsetY=canvasOffset.top;

  // get mouse position
  var mouseX=parseInt(e.clientX-offsetX);
  var mouseY=parseInt(e.clientY-offsetY);

  ctx.save();
  Translate();

  // ctx.fillStyle="#F8F";
  // ctx.fillRect(0,0,20,20);

  // hit-test each arc
  var panel_hit = HIT_NONE;
  for(var i=0;i<arcs.length;i++)
  {
    // define one arc
    var arc = arcs[i];
    defineArc(arc);

    if(( IsisPointInStrokeSupported === true ) && ( ctx.isPointInStroke(mouseX,mouseY)))
    {
      // console.log("arc", i );
      panel_hit = i;
      // ctx.fillStyle=arc.color_stop_3_color;
      // ctx.fillRect(0,0,20,20);
      break;
    }
  }
  draw_panel(panel_hit, e.clientX, e.clientY);
  ctx.restore();

}

function UpdateTime()
{ "use strict";
  function timenow(){
      var now= new Date(), 
      ampm= 'am', 
      h= now.getHours(), 
      m= now.getMinutes(), 
      s= now.getSeconds();
      if(h>= 12){
          if(h>12) h -= 12;
          ampm= 'pm';
      }
  
      if(m<10) m= '0'+m;
      if(s<10) s= '0'+s;
      // return now.toLocaleDateString()+ ' ' + h + ':' + m + ':' + s + ' ' + ampm;
      return h + ':' + m + ':' + s + ampm;
  }
  $(".info_box").html(timenow());
}

$(document).ready(function()
{ "use strict";

  function PulseCompanyText() 
  { "use strict";
    DrawCompanyText(false);
  }
  _DrawLogo(1);
  setInterval(PulseCompanyText, 20);

  // set up small "time" info box, if asked to do so
  // $( ".info_box" ).hide();
  if( ShowInfoBox === true )
  {
    // $( ".info_box" ).css("display", "block" );
    $( ".info_box" ).show();

    UpdateTime();
    setInterval(UpdateTime, 1000);
    $( ".info_box" ).hover(
      function() 
      {
        $( this ).fadeTo("fast", 0.55);
      },
      function() 
      {
        $( this ).fadeTo("slow", 1.50);
      }
    );
  }

  // Some browsers do not support isPointInStroke().
  // unfortunately, because of browser HELL, we can't even find a reliable
  // way to detect which browser we are running (no kidding) or if the isPointInStroke()
  // feature is supported.
  // Anyway, what we try here is to just call the feature and, if we
  // get an exception signal we have no support.  Jeezus.
  //
  try
  {
    // x=1;     // uncomment for testing with non-IE browsers -- this just forces and exception...
    ctx.isPointInStroke(0,0);
  }
  catch(e)
  {
    IsisPointInStrokeSupported = false;
    // for IE we display the menu bar
    MenuBarHeight = 54;
    $( ".iot_navbar" ).css("display", "block" );

    // capture our dropdown menu bar events
    $( ".iot_menu_dropdown" ).hover(
      function() 
      {
        // see if hover is in our dropdown menu
        var tag = this.id;
        var NumPanels = panel_content.length;
        for( var i = 0; i < NumPanels; ++i)
        {
          if( tag == panel_content[i].panel_id )
          {
            var rect = this.getBoundingClientRect();
            // console.log(rect.top, rect.right, rect.bottom, rect.left);
            draw_panel(i, rect.right+4, rect.top, this.offsetTop, 10);
          }
        }
      }
    );
    // if mouse leaves our dropdown, tear down panel
    $( ".iot_menu_dropdown" ).mouseleave(
      function() 
      {
        draw_panel(HIT_DOC, 0,0 );
      }
    );
  }

});       


