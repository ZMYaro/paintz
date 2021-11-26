# Manual test plan

\*\*Every keyboard shortcut that is not a single key should be attempted in and out of a text box.\*\*

## Document functions
1. Clear  
	a. Open clear dialog with:  
		i. Toolbar button  
		ii. Ctrl+N in standalone window  
		iii. Alt+F,N in standalone window  
	b. Fail to open clear dialog in tab with Ctrl+N  
	c. X out of clear dialog  
	d. Cancel clear dialog  
	e. Clear canvas from clear dialog  
	f. Fail to clear canvas without confirmation in tab with Ctrl+Shift+N  
	g. Clear canvas without confirmation with:  
		i. Ctrl+Shift+N in standalone window  
		ii. Alt+I,C in standalone window  

2. Open  
	a. Open the open dialog with:  
		i. Toolbar button  
		ii. Ctrl+O  
		iii. Cmd+O on Apple device  
		iv. Alt+F,O in standalone window  
	b. Cancel the open dialog  
	c. Open a file with:  
		i. The open dialog  
		ii. Drag and drop from the file browser  
		iii. Drag and drop from another webpage  
		iv. Open with PaintZ from the file browser (if supported)  
		v. Share to PaintZ from system share function (if supported)  

3. Save  
	a. Open save dialog with:  
		i. Toolbar button  
		ii. Ctrl+S  
		iii. Cmd+S on Apple device  
		iv. Alt+F,S in standalone window  
		v. Alt+F,A in standalone window  
	f. X out of save dialog  
	g. Cancel save dialog  
	h. Type a file name with .jpg/.jpeg/.jfif file extension while the dialog is set to JPEG  
	i. Type a file name with .jpg/.jpeg/.jfif file extension while the dialog is set to PNG  
	j. Type a file name with .png file extension while the dialog is set to JPEG  
	k. Type a file name with .png file extension while the dialog is set to PNG  
	l. Type a file name with a different image file extension while the dialog is set to JPEG  
	m. Type a file name with a different image file extension while the dialog is set to PNG  
	n. Type a file name with a period at the end of the file name while the dialog is set to JPEG  
	o. Type a file name with a period at the end of the file name while the dialog is set to PNG  
	p. Save as a JPEG  
	q. Save as a PNG  
	r. Share as a JPEG _OR_ confirm share button is disabled if unsupported  
	s. Share as a PNG  _OR_ confirm share button is disabled if unsupported  
	t. Share (if supported) with dialog closed in standalone window with Alt+F,E  
	u. Share (if supported) with dialog closed in standalone window with Alt+F,D  

4. Print  
    a. Print with:  
		i. Toolbar button  
		ii. Ctrl+P  
		iii. Browser print command  
		iv. Alt+F,V in standalone window  
		v. Alt+F,P in standalone window  
		vi. Alt+F,R,P in standalone window  
		vii. Alt+F,R,V in standalone window  

5. Undo/redo  
	a. Undo with:  
		i. Toolbar button  
		ii. Ctrl+Z  
		iii. Cmd+Z on Apple device  
		iv. Alt+E,U in standalone window  
	b. Redo with:  
		i. Toolbar button  
		ii. Ctrl+Y  
		iii. Ctrl+Shift+Z  
		iv. Cmd+Y on Apple device  
		v. Cmd+Shift+Z on Apple device  
		vi. Alt+E,R in standalone window  

6. Resize  
	a. Open resize dialog with:  
		i. Toolbar button  
		ii. Bottom bar button  
		iii. Ctrl+E  
		iv. Cmd+E on Apple device  
		v. Alt+I,A in standalone window  
		vi. Alt+H,R,E in standalone window  
	b. X out of resize dialog  
	c. Cancel resize dialog  
	d. Change the percentage width without mantaining aspect ratio  
	e. Change the percentage width with maintaining aspect ratio  
	f. Change the percentage height without mantaining aspect ratio  
	g. Change the percentage height with maintaining aspect ratio  
	h. Crop smaller to percentage  
	i. Crop larger to percentage   
	j. Scale down to percentage  
	k. Scale up to percentage  
	l. Repeat steps dk- with pixel dimensions  
	m. Reset input dimensions by switching from percentage to pixel dimensions and vice versa  

7. Paste  
    a. Paste image data with:  
		i. Toolbar button (_OR_ receive message if unsupported)  
		ii. Browser paste command  
		iii. Browser keyboard shortcut(s) (Ctrl+V, Cmd+V, Shift+Insert)  
		iv. Alt+E,P in standalone window  
		v. Alt+H,V,P in standalone window  
    b. Repeat step a with non-image data on the clipboard and have it ignored    
    c. Paste image data while zoomed in  
    d. “Paste from” a file with:  
		i. Alt+clicking toolbar button  
		ii. Right-clicking toolbar button  
		iii. Long-pressing toolbar button  
		iv. Ctrl+Alt+V  
		v. Cmd+Alt+V on Apple device  
		vi. Alt+E,F in standalone window  
		vii. Alt+H,V,F in standalone window  

8. Zoom  
	a. Zoom to arbitrary percentage  
	b. Focus zoom text field in standalone window with Alt+V,Z,U  
	c. Zoom in and out with slider  
	d. Zoom in with:  
		i. Toolbar button  
		ii. Ctrl+Alt+=  
		iii. Ctrl+Alt+Shift+= (Ctrl+Alt++)  
		iv. Cmd+Opt+= on Apple device  
		v. Cmd+Opt+Shift+= (Cmd+Opt++) on Apple device  
		vi. Ctrl+PgUp in standalone window  
		vii. Alt+V,I in standalone window  
	e. Zoom out with:  
		i. Toolbar button  
		ii. Ctrl+Alt+-  
		iii. Cmd+Opt+- on Apple device  
		iv. Ctrl+PgDn in standalone window  
		v. Alt+V,O in standalone window  
	f. Fail to zoom in in tab with Ctrl+PgUp  
	g. Fail to zoom out in tab with Ctrl+PgDn  
	h. Zoom to 400% in standalone window with Alt+V,Z,L  
	s. Reset zoom to 100% with:  
		i. Ctrl+Alt+0  
		ii. Cmd+Opt+0 on Apple device  
		iii. Alt+V,Z,N in standalone window  
		iv. Alt+V,M in standalone window  


## Tools
9. Pencil tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. P key  
		iii. Alt+H,P in standalone window  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill color right click  
	d. Draw after changing line color  
	e. Draw after changing fill color  
	f. Undo drawing  

10. Brush/doodle tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. B key  
		iii. Alt+H,B in standalone window  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill color with right click  
	d. Draw after changing line color  
	e. Draw after changing fill color  
	f. Draw after changing line width  
	g. Undo drawing  
	h. Confirm cursor changes after increasing line width with:  
		i. Toolbar menu  
		ii. \] key  
		iii. Alt+H,S,Z in standalone window  
	i. Confirm cursor changes after decreasing line width with:  
		i. Toolbar menu  
		ii. \] key  
		iii. Alt+H,S,Z in standalone window  

11. Airbrush tool  
	a. Select tool with toolbar button  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill color right click  
	d. Draw after changing line color  
	e. Draw after changing fill color  
	f. Draw after changing line width  
	g. Undo drawing  

12. Line tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. L key  
		ii. Alt+H,S,H in standalone window  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill color with right click  
	d. Draw after changing line color  
	e. Draw after changing fill color  
	f. Draw after changing line width  
	g. Undo drawing  

13. Curve tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. C key  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill color with right click  
	d. Draw a line and change tools  
	e. Draw a curve with 1 control point and change tools  
	f. Draw after changing line color  
	g. Draw after changing fill color  
	h. Draw after changing line width  
	i. Undo drawing  

14. Rectangle tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. R key  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill color with right click  
	d. Draw with line only  
	e. Draw with fill only  
	f. Draw with line and fill  
	g. Draw after changing line color  
	h. Draw after changing fill color  
	i. Draw after changing line width  
	j. Draw square by holding Shift while drawing  
	k. Draw from center by holding Ctrl while drawing  
	l. Draw square from center by holding Ctrl+Shift while drawing  
	m. Draw from center on Apple device by holding Cmd while drawing  
	n. Draw square from center on Apple device by holding Cmd+Shift while drawing  
	o. Undo drawing  

15. Oval tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. O key  
	b. Draw with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with fill with right click  
	d. Draw with line only  
	e. Draw with fill only  
	f. Draw with line and fill  
	g. Draw after changing line color  
	h. Draw after changing fill color  
	i. Draw after changing line width  
	j. Draw circle by holding Shift while drawing  
	k. Draw from center by holding Ctrl while drawing  
	l. Draw circle from center by holding Ctrl+Shift while drawing  
	m. Draw from center on Apple device by holding Cmd while drawing  
	n. Draw circle from center on Apple device by holding Cmd+Shift while drawing  
	o. Undo drawing  

16. Pan/hand tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. H key  
	b. Pan with:  
		i. Left click  
		ii. Single-point touch  

17. Rectangular selection tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. S key  
		iii. Alt+I,F in standalone window  
		iv. Alt+H,S,E,R in standalone window  
	b. Rotate image counterclockwise with:  
		i. Toolbar button  
		ii. Alt+H,R,O,L in standalone window  
	c. Rotate image clockwise with:  
		i. Toolbar button  
		ii. Alt+H,R,O,R in standalone window  
	d. Rotate image 180° in standalone window with Alt+H,R,O,T  
	e. Flip image horizontally with:  
		i. Toolbar button  
		ii. Alt+H,R,O,H in standalone window  
	f. Flip image vertically with:  
		i. Toolbar button  
		ii. Alt+H,R,O,V in standalone window  
	g. Select region with:  
		i. Left click  
		ii. Single-point touch  
	h. Select all with:  
		i. Toolbar button  
		ii. Ctrl+A  
		iii. Alt+E,A in standalone window  
		iv. Alt+H,S,E,A in standalone window  
	i. Rotate selection counterclockwise with:  
		i. Toolbar button  
		ii. Alt+H,R,O,L in standalone window  
	j. Rotate selection clockwise with:  
		i. Toolbar button  
		ii. Alt+H,R,O,R in standalone window  
	k. Rotate selection 180° in standalone window with Alt+H,R,O,T  
	l. Flip selection horizontally with:  
		i. Toolbar button  
		ii. Alt+H,R,O,H in standalone window  
	m. Flip selection vertically with:  
		i. Toolbar button  
		ii. Alt+H,R,O,V in standalone window  
	n. Move selection with:  
		i. Left click  
		ii. Single-point touch  
		iii. Arrow keys  
	o. Resize selection smaller with each of the 8 resize handles  
	p. Resize selection larger with each of the 8 resize handles  
	q. Repeat steps i-n after resizing  
	r. Repeat steps g-q in transparent selection mode  
	s. Change fill color between transparent selections  
	t. Change fill color with an active transparent selection  
	u. Erase selection with:  
		i. Toolbar button  
		ii. Delete key  
		iii. Backspace key  
		iv. Alt+E,L in standalone window  
		v. Alt+H,S,E,D  
	v. Duplicate selection with:  
		i. Toolbar button  
		ii. Ctrl+D  
	w. Cancel selection with:  
		i. Toolbar button  
		ii. Esc key  
	x. Crop to selection with:  
		i. Toolbar button  
		ii. Alt+H,R,P in standalone window  
	y. Undo after each of steps b-x  
	z. Zoom in/out with an active selection  
	α. Duplicate a selection while zoomed in  

18. Freeform selection tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. F key  
		iii. Alt+H,S,E,F in standalone window  
	b. Repeat steps 17b-17α with the freeform selection tool  

19. Eraser tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. E key  
	b. Draw with fill color with:  
		i. Left click  
		ii. Single-point touch  
	c. Draw with line color with right click  
	d. Draw after changing line color  
	e. Draw after changing fill color  
	f. Draw after changing line width  
	g. Undo drawing  
	h. Confirm cursor changes after increasing line width with:  
		i. Toolbar menu  
		ii. \] key  
		iii. Alt+H,S,Z in standalone window  
	i. Confirm cursor changes after decreasing line width with:  
		i. Toolbar menu  
		ii. \] key  
		iii. Alt+H,S,Z in standalone window  
	m. Confirm cursor changes after swapping line and fill colors with:  
		i. Right-clicking current colors  
		ii. Long-pressing current colors  
		iii. X key  

20. Flood fill tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. K key  
		iii. Alt+H,K in standalone window  
	b. Fill with line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Fill with fill color with right click  

21. Color picker/eyedropper tool  
	a. Select tool with:  
		i. Toolbar button  
		ii. I key  
		iii. Alt+H,D in standalone window  
	b. Select line color with:  
		i. Left click  
		ii. Single-point touch  
	c. Select fill color with right click  

22. Text tool  
	a.  Select tool with:  
		i. Toolbar button  
		ii. T key  
		iii. Alt+H,T in standalone window  
	b.  Type text in  
	c.  Paste rich text in  
	d.  Confirm local font option is not shown in unsupported browser  
	e.  Enable local font access in supported browser  
	f.  Change font between text boxes with:  
		i. Toolbar menu  
		ii. Alt+T,F,F in standalone window  
	g.  Change text size between text boxes with:  
		i. Toolbar button  
		ii. Alt+T,F,S in standalone window  
	h.  Toggle bold between text boxes with:  
		i. Toolbar button  
		ii. Ctrl+B  
		iii. Cmd+B on Apple device  
		iv. Alt+T,F,B in standalone window  
	i.  Toggle italics between text boxes with:  
		i. Toolbar button  
		ii. Ctrl+I  
		iii. Cmd+I on Apple device  
		iv. Alt+T,F,I in standalone window  
	j.  Toggle underline between text boxes with:  
		i. Toolbar button  
		ii. Ctrl+U  
		iii. Cmd+U on Apple device  
		iv. Alt+T,F,U in standalone window  
	k.  Toggle strikethorugh between text boxes with:  
		i. Toolbar button  
		ii. Alt+Shift+5  
		iii. Alt+T,F,X in standalone window  
	l. Toggle opaque background between text boxes with:  
		i. Toolbar buttons  
		ii. Alt+I,D in standalone window  
		iii. Alt+T,O/Alt+T,T in standalone window  
	m. Change line color between text boxes  
	n. Change fill color between text boxes  
	o. Repeat steps f-n while in a text box  
	p. Zoom in/out with an active text box  
	q. Resize text box smaller with each of the 8 resize handles  
	r. Resize text box larger with each of the 8 resize handles  
	s. Rasterize text by:  
		i. Selecting the canvas outside the text box  
		ii. Changing tools  
		iii. Ctrl+Enter  


## Color picker
23. Toolbar palette  
	a. Set the line color with:  
		i. Left click  
		ii. Touch  
	b. Set the fill color with:  
		i. Right click  
		ii. Long press  

24. Color picker dialog  
	a. Open color picker dialog with:  
		i. Toolbar button (current colors)  
		ii. Alt+C,E in standalone window  
		iii. Alt+H,E,C in standalone window  
		iv. Alt+T,E,C in standalone window  
	b. X out of color picker dialog  
	c. Cancel color picker dialog  
	d. Set color by hex  
	e. Set color by HSL  
	f. Set color by RGB  
	g. Set color with visual picker  
	h. Swap colors with button in dialog  


## PaintZ actions
25. Full screen  
	a. Open with:  
		i. Toolbar button  
		ii. Ctrl+F11 when PWA installed (in tab or standalone window)  
		iii. Alt+V,V in standalone window  
		iv. Alt+V,F in standalone window  

26. Settings  
	a. Open settings dialog with toolbar button  
	b. X out of settings dialog  
	c. Cancel settings dialog  
	d. Set theme to default with no system override  
	e. Set theme to dark with no system override  
	f. Set theme to light with no system override  
	g. Set theme to default with system override  
	h. Set theme to light with system override  
	i. Set color palette to Material  
	j. Set color palette to Windows Classic  
	k. Set color palette to Windows 7  
	l. Turn gridlines on  
	m. Turn gridlines off  
	n. Toggle gridlines with dialog closed with:  
		i. Ctrl+G  
		ii. Alt+V,Z,G in standalone window  
		iii. Alt+V,G in standalone window  
	o. Turn semi-transparent drawing previews on and draw something  
	p. Turn semi-transparent drawing previews off and draw something  
	q. Turn smooth edges (anti-aliasing) on and draw something  
	r. Turn smooth edges (anti-aliasing) off and draw something  
	s. Set maximum undo levels to 3, draw some things, and try to undo/redo  
	t. Set maximum undo levels to 5, draw some things, and try to undo/redo  
	u. Reset settings to defaults  

27. About  
	a. Open about dialog with:  
		i. Toolbar button  
		ii. Alt+H,A in standalone window  
		iii. Alt+F,T in standalone window  
	b. X out of about dialog  
	c. Close out of about dialog  
	d. Open each link  

28. Help  
	a. Open help dialog with:  
		i. Toolbar button  
		ii. F11 key  
		iii. Alt+H,H in standalone window  
		iv. Alt+Y in standalone window  
	b. X out of help dialog  
	c. Close out of help dialog  

29. Keyboard shortcuts  
	a. Open keyboard shortcuts dialog with Shift+/ (?)  
	b. Open keyboard shortcuts dialog with Ctrl+Shift+/ (Ctrl+?)  
	c. X out of keyboard shortcuts dialog  
	d. Close out of keyboard shortcuts dialog  
	e. Open MS Paint access keys reference dialog with Ctrl+Alt+Shift+/ (Ctrl+Alt+?)  
    f. X out of MS Paint access keys reference dialog  
    g. Close out of MS Paint access keys reference dialog  

30. Long-use prompts  
	a. Confirm installation prompt appears after saving 10 images  
	b. Confirm Ko-fi prompt appears after saving 50 images  
	c. Confirm rating prompt appears after saving 100 images  
	d. Confirm Patreon prompt appears after saving 500 images  
	(You can force the save count by running `settings.set('saveCount', X)`, where `X` is any number.)  

31. General interface  
    a. Scroll toolbar horizontally in narrow window with Shift+scroll  
    b. Scroll toolbar horizontally in narrow window with vertical scroll  
    c. Scroll toolbar horizontally in narrow window with touch  
    d. Confirm dimensions and pointer coordinates shown on bottom bar in wide window  
    e. Confirm dimensions and pointer coordinates hidden in narrow window  
	f. Confirm MS Paint access keys do not work in tab  
