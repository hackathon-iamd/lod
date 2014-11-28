<!DOCTYPE HTML>
<!--
	Arcana by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
<html>
	<head>
		<title>LoD</title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<meta name="description" content="" />
		<meta name="keywords" content="" />
		<!--[if lte IE 8]><script src="css/ie/html5shiv.js"></script><![endif]-->
		<script src="js/jquery.min.js"></script>
		<script src="js/jquery.dropotron.min.js"></script>
		<script src="js/skel.min.js"></script>
		<script src="js/skel-layers.min.js"></script>
		<script src="js/init.js"></script>
		<noscript>
			<link rel="stylesheet" href="css/skel.css" />
			<link rel="stylesheet" href="css/style.css" />
			<link rel="stylesheet" href="css/style-wide.css" />
		</noscript>
		<!--[if lte IE 8]><link rel="stylesheet" href="css/ie/v8.css" /><![endif]-->
	</head>
	<body>

		<!-- Header -->
			<div id="header">
						
				<!-- Logo -->
					<h1>
						<img src="images/lod_logo.jpg" alt=""/>
						<!-- <a href="index.php" id="logo">L<em>eague</em> o<em>f</em> D<em>ata</em></a> -->
					</h1>
					<!-- <h1><a href="index.html" id="logo"><em>L</em>eague <em>o</em>f <em>D</em>ata</a></h1> -->
				
				<!-- Nav -->
					<nav id="nav">
						<ul>
							<li <?php echo ($_GET['action'] == "accueil" ? "class=\"current\"" : "");?>><a href="index.php">Home</a></li>
<?php
	$pages = array(
		"Project" => array(
			"context" => "Context",
			"subject" => "Subject",
			"expectation" => "Expectation",
			"done" => "Done",
			"todo" => "To do",
			"references" => "References",
			"conclusion" => "Conclusion"

		), 
		"Team" => array(
			"team" => "The team",
			"ja" => "Jonathan ARNAULT",
			"mb" => "Mathieu BUCHHEIT",
			"ol" => "Ondine LAMY",
			"aw" => "Alexandre WEILER"
		),
		"Partners" => array(
			"tn" => "TELECOM Nancy",
			"ca" => "Crédit Agricole S.A.",
			"intech" => "In Tech",
			"bhc" => "b.h. consulting",
			"loria" => "Loria",
			"inria" => "Inria",
			"dataconnexions" => "DataConnexions"
		)
	);

	foreach ($pages as $categorie => $contenu) {
		echo "
							<li ".(array_key_exists($_GET['action'], $contenu) ? " class=\"current\"" : "").">
								<a href=\"#\">{$categorie}</a>
								<ul>";
		foreach($contenu as $page => $nom){
			echo "
									<li><a href=\"index.php?action={$page}\">{$nom}</a></li>";
		}
		echo "
								</ul>
							</li>";
	}
?>
<!--									<li><a href="index.php?action=context">Context</a></li>
									<li><a href="index.php?action=subject">Subject</a></li>
									<li><a href="index.php?action=expectation">Expectation</a></li>
									<li><a href="index.php?action=done">Done</a></li>
									<li><a href="index.php?action=todo">To do</a></li>
									<li><a href="index.php?action=references">References</a></li>
									<li><a href="index.php?action=conclusion">Conclusion</a></li>-->
									<!-- <li>
										<a href="">Submenu</a>
										<ul>
											<li><a href="#">Lorem dolor</a></li>
											<li><a href="#">Phasellus magna</a></li>
											<li><a href="#">Magna phasellus</a></li>
											<li><a href="#">Etiam nisl</a></li>
											<li><a href="#">Veroeros feugiat</a></li>
										</ul>
									</li>

							<li>
								<a href="">Team</a>
								<ul>
									<li><a href="index.php?action=team">The team</a></li>
									<li><a href="index.php?action=ja">Jonathan ARNAULT</a></li>
									<li><a href="index.php?action=mb">Mathieu BUCHHEIT</a></li>
									<li><a href="index.php?action=ol">Ondine LAMY</a></li>
									<li><a href="index.php?action=aw">Alexandre WEILER</a></li>
								</ul>
							</li>
							<li>
								<a href="">Partners</a>
								<ul>
									<li><a href="index.php?action=tn">TELECOM Nancy</a></li>
									<li><a href="index.php?action=bhc">b.h. consulting</a></li>
									<li><a href="index.php?action=ca">Crédit agricole</a></li>
								</ul>
							</li> -->
						</ul>
					</nav>

			</div>

			<!-- Main -->