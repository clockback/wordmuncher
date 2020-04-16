function drawStars(starsContainer, noStars, clear = true) {
  if (clear)
  {
    starsContainer.innerHTML = "";
  }
  for (var i = 0; i < noStars; i ++)
  {
    var starSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    starSVG.style.marginLeft = "1px";
    starSVG.style.marginRight = "1px";
    starSVG.setAttributeNS(null, "width", 23);
    starSVG.setAttributeNS(null, "height", 23);

    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute(
      "points",
      "12.0,17.0 "
      + "17.877852522924734,20.090169943749473 "
      + "16.755282581475768,13.545084971874736 "
      + "21.510565162951536,8.909830056250527 "
      + "14.938926261462367,7.954915028125264 "
      + "12.000000000000002,2.0 "
      + "9.061073738537635,7.954915028125262 "
      + "2.4894348370484654,8.909830056250524 "
      + "7.244717418524232,13.545084971874736 "
      + "6.122147477075266,20.090169943749473 "
    );

    polygon.style.fill = "yellow";
    polygon.style.stroke = "black";
    polygon.style.strokeWidth = "2";
    starSVG.appendChild(polygon);
    starsContainer.appendChild(starSVG);
  }
}
