<?php
if(!isset($_GET['action']) || $_GET['action'] == "")
	$_GET['action'] = "accueil";

include("sources/header.php");

include("sources/{$_GET['action']}.php");

include("sources/footer.php");

?>