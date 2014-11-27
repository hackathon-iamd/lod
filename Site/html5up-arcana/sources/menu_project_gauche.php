									<section>
										<h3>Project</h3>
										<ul class="links">
<?php 
foreach($pages["Project"] as $page => $nom)
	echo "
											<li><a href=\"index.php?action={$page}\">{$nom}</a></li>";
?>
										</ul>
									</section>