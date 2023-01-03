<?php
error_reporting(0);
if(!isset($_SESSION)){
    session_start();
}
if(isset( $_POST['language'])){
		$language = $_POST['language'];
		$_SESSION['language'] = $language;	
	} 
	?>



	<script src="http://www.microsoftTranslator.com/ajax/v3/WidgetV3.ashx?siteData=ueOIGRSKkd965FeEGM5JtQ**" type="text/javascript"></script>
<!--  Bing Translator Script End-->
<style>
#WidgetFloaterPanels{display:none;visibility:hidden;}
</style>
<script>
	$(document).ready(function(){
		Microsoft.Translator.Widget.Translate('en', <?php if(!empty($_SESSION['language'])) { echo "'".$_SESSION['language']."'"; } else if(($_SESSION['language']='fa'))  { } ?>, onProgress, onError, onComplete, onRestoreOriginal, 500000);		
//		if( $('#lang').length<1)
	//		$('body').append(' <select id="lang"  style="position:absolute;top:0;">	<option value="en"> English</option>   <option value="hi"> Hindi</option> </select>');
/*		$('#lang').bind('change',function(){	
			var from ='en';
			var to = $('#lang option:selected').val();
			Microsoft.Translator.Widget.Translate('en', to, onProgress, onError, onComplete, onRestoreOriginal, 2000);						
		})*/
	});
	

		 //You can use Microsoft.Translator.Widget.GetLanguagesForTranslate to map the language code with the language name
        function onProgress(value) {
            //document.getElementById('counter').innerHTML = Math.round(value);
						Microsoft.Translator.Widget.domTranslator.showHighlight = false; 
			Microsoft.Translator.Widget.domTranslator.showTooltips = false;
        }
		
		function changeLanguage(to){
			var from ='en';			
			Microsoft.Translator.Widget.Translate('en', to, onProgress, onError, onComplete, onRestoreOriginal, 2000);		
			Microsoft.Translator.Widget.domTranslator.showHighlight = false; 
			Microsoft.Translator.Widget.domTranslator.showTooltips = false;
		}
		

        function onError(error) {
            alert("Translation Error: " + error);
        }

        function onComplete() {
            //document.getElementById('counter').style.color = 'green';
			jQuery('.WidgetFloaterPanels').hide();
			Microsoft.Translator.Widget.domTranslator.showHighlight = false; 
			Microsoft.Translator.Widget.domTranslator.showTooltips = false;
        }
        //fires when the user clicks on the exit box of the floating widget
        function onRestoreOriginal() { 
					Microsoft.Translator.Widget.domTranslator.showHighlight = false; 
			Microsoft.Translator.Widget.domTranslator.showTooltips = false;
            //alert("The page was reverted to the original language. This message is not part of the widget.");
        }				
</script>
