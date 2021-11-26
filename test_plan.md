# Manual test plan

\*\*Every keyboard shortcut that is not a single key should be attempted in and out of a text box.\*\*

## Document functions
1. Clear  
	1. Open clear dialog with:  
		1. Toolbar button  
		2. Ctrl+N in standalone window  
		3. Alt+F,N in standalone window  
	2. Fail to open clear dialog in tab with Ctrl+N  
	3. X out of clear dialog  
	4. Cancel clear dialog  
	5. Clear canvas from clear dialog  
	6. Fail to clear canvas without confirmation in tab with Ctrl+Shift+N  
	7. Clear canvas without confirmation with:  
		1. Ctrl+Shift+N in standalone window  
		2. Alt+I,C in standalone window  

2. Open  
	1. Open the open dialog with:  
		1. Toolbar button  
		2. Ctrl+O  
		3. Cmd+O on Apple device  
		4. Alt+F,O in standalone window  
	2. Cancel the open dialog  
	3. Open a file with:  
		1. The open dialog  
		2. Drag and drop from the file browser  
		3. Drag and drop from another webpage  
		4. Open with PaintZ from the file browser (if supported)  
		5. Share to PaintZ from system share function (if supported)  

3. Save  
	1. Open save dialog with:  
		1. Toolbar button  
		2. Ctrl+S  
		3. Cmd+S on Apple device  
		4. Alt+F,S in standalone window  
		5. Alt+F,A in standalone window  
	6. X out of save dialog  
	7. Cancel save dialog  
	8. Type a file name with .jpg/.jpeg/.jfif file extension while the dialog is set to JPEG  
	9. Type a file name with .jpg/.jpeg/.jfif file extension while the dialog is set to PNG  
	10. Type a file name with .png file extension while the dialog is set to JPEG  
	11. Type a file name with .png file extension while the dialog is set to PNG  
	12. Type a file name with a different image file extension while the dialog is set to JPEG  
	13. Type a file name with a different image file extension while the dialog is set to PNG  
	14. Type a file name with a period at the end of the file name while the dialog is set to JPEG  
	15. Type a file name with a period at the end of the file name while the dialog is set to PNG  
	16. Save as a JPEG  
	17. Save as a PNG  
	18. Share as a JPEG _OR_ confirm share button is disabled if unsupported  
	19. Share as a PNG  _OR_ confirm share button is disabled if unsupported  
	20. Share (if supported) with dialog closed in standalone window with Alt+F,E  
	21. Share (if supported) with dialog closed in standalone window with Alt+F,D  

4. Print  
	1. Print with:  
		1. Toolbar button  
		2. Ctrl+P  
		3. Browser print command  
		4. Alt+F,V in standalone window  
		5. Alt+F,P in standalone window  
		6. Alt+F,R,P in standalone window  
		7. Alt+F,R,V in standalone window  

5. Undo/redo  
	1. Undo with:  
		1. Toolbar button  
		2. Ctrl+Z  
		3. Cmd+Z on Apple device  
		4. Alt+E,U in standalone window  
	2. Redo with:  
		1. Toolbar button  
		2. Ctrl+Y  
		3. Ctrl+Shift+Z  
		4. Cmd+Y on Apple device  
		5. Cmd+Shift+Z on Apple device  
		6. Alt+E,R in standalone window  

6. Resize  
	1. Open resize dialog with:  
		1. Toolbar button  
		2. Bottom bar button  
		3. Ctrl+E  
		4. Cmd+E on Apple device  
		5. Alt+I,A in standalone window  
		6. Alt+H,R,E in standalone window  
	2. X out of resize dialog  
	3. Cancel resize dialog  
	4. Change the percentage width without mantaining aspect ratio  
	5. Change the percentage width with maintaining aspect ratio  
	6. Change the percentage height without mantaining aspect ratio  
	7. Change the percentage height with maintaining aspect ratio  
	8. Crop smaller to percentage  
	9. Crop larger to percentage   
	10. Scale down to percentage  
	11. Scale up to percentage  
	12. Repeat steps iv-xi with pixel dimensions  
	13. Reset input dimensions by switching from percentage to pixel dimensions and vice versa  

7. Paste  
	1. Paste image data with:  
		1. Toolbar button (_OR_ receive message if unsupported)  
		2. Browser paste command  
		3. Browser keyboard shortcut(s) (Ctrl+V, Cmd+V, Shift+Insert)  
		4. Alt+E,P in standalone window  
		5. Alt+H,V,P in standalone window  
	2. Repeat step i with non-image data on the clipboard and have it ignored  
	3. Paste image data while zoomed in  
	4. “Paste from” a file with:  
		1. Alt+clicking toolbar button  
		2. Right-clicking toolbar button  
		3. Long-pressing toolbar button  
		4. Ctrl+Alt+V  
		5. Cmd+Alt+V on Apple device  
		6. Alt+E,F in standalone window  
		7. Alt+H,V,F in standalone window  

8. Zoom  
	1. Zoom to arbitrary percentage  
	2. Focus zoom text field in standalone window with Alt+V,Z,U  
	3. Zoom in and out with slider  
	4. Zoom in with:  
		1. Toolbar button  
		2. Ctrl+Alt+=  
		3. Ctrl+Alt+Shift+= (Ctrl+Alt++)  
		4. Cmd+Opt+= on Apple device  
		5. Cmd+Opt+Shift+= (Cmd+Opt++) on Apple device  
		6. Ctrl+PgUp in standalone window  
		7. Alt+V,I in standalone window  
	5. Zoom out with:  
		1. Toolbar button  
		2. Ctrl+Alt+-  
		3. Cmd+Opt+- on Apple device  
		4. Ctrl+PgDn in standalone window  
		5. Alt+V,O in standalone window  
	6. Fail to zoom in in tab with Ctrl+PgUp  
	7. Fail to zoom out in tab with Ctrl+PgDn  
	8. Zoom to 400% in standalone window with Alt+V,Z,L  
	9. Reset zoom to 100% with:  
		1. Ctrl+Alt+0  
		2. Cmd+Opt+0 on Apple device  
		3. Alt+V,Z,N in standalone window  
		4. Alt+V,M in standalone window  


## Tools
9. Pencil tool  
	1. Select tool with:  
		1. Toolbar button  
		2. P key  
		3. Alt+H,P in standalone window  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill color right click  
	4. Draw after changing line color  
	5. Draw after changing fill color  
	6. Undo drawing  

10. Brush/doodle tool  
	1. Select tool with:  
		1. Toolbar button  
		2. B key  
		3. Alt+H,B in standalone window  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill color with right click  
	4. Draw after changing line color  
	5. Draw after changing fill color  
	6. Draw after changing line width  
	7. Undo drawing  
	8. Confirm cursor changes after increasing line width with:  
		1. Toolbar menu  
		2. \] key  
		3. Alt+H,S,Z in standalone window  
	9. Confirm cursor changes after decreasing line width with:  
		1. Toolbar menu  
		2. \] key  
		3. Alt+H,S,Z in standalone window  

11. Airbrush tool  
	1. Select tool with toolbar button  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill color right click  
	4. Draw after changing line color  
	5. Draw after changing fill color  
	6. Draw after changing line width  
	7. Undo drawing  

12. Line tool  
	1. Select tool with:  
		1. Toolbar button  
		2. L key  
		2. Alt+H,S,H in standalone window  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill color with right click  
	4. Draw after changing line color  
	5. Draw after changing fill color  
	6. Draw after changing line width  
	7. Undo drawing  

13. Curve tool  
	1. Select tool with:  
		1. Toolbar button  
		2. C key  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill color with right click  
	4. Draw a line and change tools  
	5. Draw a curve with 1 control point and change tools  
	6. Draw after changing line color  
	7. Draw after changing fill color  
	8. Draw after changing line width  
	9. Undo drawing  

14. Rectangle tool  
	1. Select tool with:  
		1. Toolbar button  
		2. R key  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill color with right click  
	4. Draw with line only  
	5. Draw with fill only  
	6. Draw with line and fill  
	7. Draw after changing line color  
	8. Draw after changing fill color  
	9. Draw after changing line width  
	10. Draw square by holding Shift while drawing  
	11. Draw from center by holding Ctrl while drawing  
	12. Draw square from center by holding Ctrl+Shift while drawing  
	13. Draw from center on Apple device by holding Cmd while drawing  
	14. Draw square from center on Apple device by holding Cmd+Shift while drawing  
	15. Undo drawing  

15. Oval tool  
	1. Select tool with:  
		1. Toolbar button  
		2. O key  
	2. Draw with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with fill with right click  
	4. Draw with line only  
	5. Draw with fill only  
	6. Draw with line and fill  
	7. Draw after changing line color  
	8. Draw after changing fill color  
	9. Draw after changing line width  
	10. Draw circle by holding Shift while drawing  
	11. Draw from center by holding Ctrl while drawing  
	12. Draw circle from center by holding Ctrl+Shift while drawing  
	13. Draw from center on Apple device by holding Cmd while drawing  
	14. Draw circle from center on Apple device by holding Cmd+Shift while drawing  
	15. Undo drawing  

16. Pan/hand tool  
	1. Select tool with:  
		1. Toolbar button  
		2. H key  
	2. Pan with:  
		1. Left click  
		2. Single-point touch  

17. Rectangular selection tool  
	1. Select tool with:  
		1. Toolbar button  
		2. S key  
		3. Alt+I,F in standalone window  
		4. Alt+H,S,E,R in standalone window  
	2. Rotate image counterclockwise with:  
		1. Toolbar button  
		2. Alt+H,R,O,L in standalone window  
	3. Rotate image clockwise with:  
		1. Toolbar button  
		2. Alt+H,R,O,R in standalone window  
	4. Rotate image 180° in standalone window with Alt+H,R,O,T  
	5. Flip image horizontally with:  
		1. Toolbar button  
		2. Alt+H,R,O,H in standalone window  
	6. Flip image vertically with:  
		1. Toolbar button  
		2. Alt+H,R,O,V in standalone window  
	7. Select region with:  
		1. Left click  
		2. Single-point touch  
	8. Select all with:  
		1. Toolbar button  
		2. Ctrl+A  
		3. Alt+E,A in standalone window  
		4. Alt+H,S,E,A in standalone window  
	9. Rotate selection counterclockwise with:  
		1. Toolbar button  
		2. Alt+H,R,O,L in standalone window  
	10. Rotate selection clockwise with:  
		1. Toolbar button  
		2. Alt+H,R,O,R in standalone window  
	11. Rotate selection 180° in standalone window with Alt+H,R,O,T  
	12. Flip selection horizontally with:  
		1. Toolbar button  
		2. Alt+H,R,O,H in standalone window  
	13. Flip selection vertically with:  
		1. Toolbar button  
		2. Alt+H,R,O,V in standalone window  
	14. Move selection with:  
		1. Left click  
		2. Single-point touch  
		3. Arrow keys  
	15. Resize selection smaller with each of the 8 resize handles  
	16. Resize selection larger with each of the 8 resize handles  
	17. Repeat steps ix-xiv after resizing  
	18. Repeat steps vii-xvii in transparent selection mode  
	19. Change fill color between transparent selections  
	20. Change fill color with an active transparent selection  
	21. Erase selection with:  
		1. Toolbar button  
		2. Delete key  
		3. Backspace key  
		4. Alt+E,L in standalone window  
		5. Alt+H,S,E,D  
	22. Duplicate selection with:  
		1. Toolbar button  
		2. Ctrl+D  
	23. Cancel selection with:  
		1. Toolbar button  
		2. Esc key  
	24. Crop to selection with:  
		1. Toolbar button  
		2. Alt+H,R,P in standalone window  
	25. Undo after each of steps ii-xxiv  
	26. Zoom in/out with an active selection  
	27. Duplicate a selection while zoomed in  

18. Freeform selection tool  
	1. Select tool with:  
		1. Toolbar button  
		2. F key  
		3. Alt+H,S,E,F in standalone window  
	2. Repeat steps 17.ii-17.xxvii with the freeform selection tool  

19. Eraser tool  
	1. Select tool with:  
		1. Toolbar button  
		2. E key  
	2. Draw with fill color with:  
		1. Left click  
		2. Single-point touch  
	3. Draw with line color with right click  
	4. Draw after changing line color  
	5. Draw after changing fill color  
	6. Draw after changing line width  
	7. Undo drawing  
	8. Confirm cursor changes after increasing line width with:  
		1. Toolbar menu  
		2. \] key  
		3. Alt+H,S,Z in standalone window  
	9. Confirm cursor changes after decreasing line width with:  
		1. Toolbar menu  
		2. \] key  
		3. Alt+H,S,Z in standalone window  
	13. Confirm cursor changes after swapping line and fill colors with:  
		1. Right-clicking current colors  
		2. Long-pressing current colors  
		3. X key  

20. Flood fill tool  
	1. Select tool with:  
		1. Toolbar button  
		2. K key  
		3. Alt+H,K in standalone window  
	2. Fill with line color with:  
		1. Left click  
		2. Single-point touch  
	3. Fill with fill color with right click  

21. Color picker/eyedropper tool  
	1. Select tool with:  
		1. Toolbar button  
		2. I key  
		3. Alt+H,D in standalone window  
	2. Select line color with:  
		1. Left click  
		2. Single-point touch  
	3. Select fill color with right click  

22. Text tool  
	1.  Select tool with:  
		1. Toolbar button  
		2. T key  
		3. Alt+H,T in standalone window  
	2.  Type text in  
	3.  Paste rich text in  
	4.  Confirm local font option is not shown in unsupported browser  
	5.  Enable local font access in supported browser  
	6.  Change font between text boxes with:  
		1. Toolbar menu  
		2. Alt+T,F,F in standalone window  
	7.  Change text size between text boxes with:  
		1. Toolbar button  
		2. Alt+T,F,S in standalone window  
	8.  Toggle bold between text boxes with:  
		1. Toolbar button  
		2. Ctrl+B  
		3. Cmd+B on Apple device  
		4. Alt+T,F,B in standalone window  
	9.  Toggle italics between text boxes with:  
		1. Toolbar button  
		2. Ctrl+I  
		3. Cmd+I on Apple device  
		4. Alt+T,F,I in standalone window  
	10.  Toggle underline between text boxes with:  
		1. Toolbar button  
		2. Ctrl+U  
		3. Cmd+U on Apple device  
		4. Alt+T,F,U in standalone window  
	11.  Toggle strikethorugh between text boxes with:  
		1. Toolbar button  
		2. Alt+Shift+5  
		3. Alt+T,F,X in standalone window  
	12. Toggle opaque background between text boxes with:  
		1. Toolbar buttons  
		2. Alt+I,D in standalone window  
		3. Alt+T,O/Alt+T,T in standalone window  
	13. Change line color between text boxes  
	14. Change fill color between text boxes  
	15. Repeat steps vi-xiv while in a text box  
	16. Zoom in/out with an active text box  
	17. Resize text box smaller with each of the 8 resize handles  
	18. Resize text box larger with each of the 8 resize handles  
	19. Rasterize text by:  
		1. Selecting the canvas outside the text box  
		2. Changing tools  
		3. Ctrl+Enter  


## Color picker
23. Toolbar palette  
	1. Set the line color with:  
		1. Left click  
		2. Touch  
	2. Set the fill color with:  
		1. Right click  
		2. Long press  

24. Color picker dialog  
	1. Open color picker dialog with:  
		1. Toolbar button (current colors)  
		2. Alt+C,E in standalone window  
		3. Alt+H,E,C in standalone window  
		4. Alt+T,E,C in standalone window  
	2. X out of color picker dialog  
	3. Cancel color picker dialog  
	4. Set color by hex  
	5. Set color by HSL  
	6. Set color by RGB  
	7. Set color with visual picker  
	8. Swap colors with button in dialog  


## PaintZ actions
25. Full screen  
	1. Open with:  
		1. Toolbar button  
		2. Ctrl+F11 when PWA installed (in tab or standalone window)  
		3. Alt+V,V in standalone window  
		4. Alt+V,F in standalone window  

26. Settings  
	1. Open settings dialog with toolbar button  
	2. X out of settings dialog  
	3. Cancel settings dialog  
	4. Set theme to default with no system override  
	5. Set theme to dark with no system override  
	6. Set theme to light with no system override  
	7. Set theme to default with system override  
	8. Set theme to light with system override  
	9. Set color palette to Material  
	10. Set color palette to Windows Classic  
	11. Set color palette to Windows 7  
	12. Turn gridlines on  
	13. Turn gridlines off  
	14. Toggle gridlines with dialog closed with:  
		1. Ctrl+G  
		2. Alt+V,Z,G in standalone window  
		3. Alt+V,G in standalone window  
	15. Turn semi-transparent drawing previews on and draw something  
	16. Turn semi-transparent drawing previews off and draw something  
	17. Turn smooth edges (anti-aliasing) on and draw something  
	18. Turn smooth edges (anti-aliasing) off and draw something  
	19. Set maximum undo levels to 3, draw some things, and try to undo/redo  
	20. Set maximum undo levels to 5, draw some things, and try to undo/redo  
	21. Reset settings to defaults  

27. About  
	1. Open about dialog with:  
		1. Toolbar button  
		2. Alt+H,A in standalone window  
		3. Alt+F,T in standalone window  
	2. X out of about dialog  
	3. Close out of about dialog  
	4. Open each link  

28. Help  
	1. Open help dialog with:  
		1. Toolbar button  
		2. F11 key  
		3. Alt+H,H in standalone window  
		4. Alt+Y in standalone window  
	2. X out of help dialog  
	3. Close out of help dialog  

29. Keyboard shortcuts  
	1. Open keyboard shortcuts dialog with Shift+/ (?)  
	2. Open keyboard shortcuts dialog with Ctrl+Shift+/ (Ctrl+?)  
	3. X out of keyboard shortcuts dialog  
	4. Close out of keyboard shortcuts dialog  
	5. Open MS Paint access keys reference dialog with Ctrl+Alt+Shift+/ (Ctrl+Alt+?)  
	6. X out of MS Paint access keys reference dialog  
	7. Close out of MS Paint access keys reference dialog  

30. Long-use prompts  
	1. Confirm installation prompt appears after saving 10 images  
	2. Confirm Ko-fi prompt appears after saving 50 images  
	3. Confirm rating prompt appears after saving 100 images  
	4. Confirm Patreon prompt appears after saving 500 images  
	(You can force the save count by running `settings.set('saveCount', X)`, where `X` is any number.)  

31. General interface  
	1. Scroll toolbar horizontally in narrow window with Shift+scroll  
	2. Scroll toolbar horizontally in narrow window with vertical scroll  
	3. Scroll toolbar horizontally in narrow window with touch  
	4. Confirm dimensions and pointer coordinates shown on bottom bar in wide window  
	5. Confirm dimensions and pointer coordinates hidden in narrow window  
	6. Confirm MS Paint access keys do not work in tab  
