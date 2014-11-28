            function ajouterSource(){
                var nom = document.getElementById("sourcename").value;
                var uri = document.getElementById("sourceuri").value;
                var endpoint=document.getElementById("sourceendpoint").value;
                
                var form={name:nom,uri:uri,endpoint:endpoint};
                console.log(form);
            }