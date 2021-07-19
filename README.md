<img src="./img/tags/GAMECHANGER-NoPentagon_RGB@3x.png" align="right"
     alt="Mission Vision Icons" width="300" >
# Introduction

Over 15 thousand documents govern how the Department of Defense (DoD) operates. The documents exist in different repositories, often exist on different networks, are discoverable to different communities, are updated independently, and evolve rapidly. No single ability has ever existed that would enable navigation of the vast universe of governing requirements and guidance documents, leaving the Department unable to make evidence-based, data-driven decisions. Today GAMECHANGER offers a scalable solution with an authoritative corpus comprising a single trusted repository of all statutory and policy driven requirements based on Artificial-Intelligence (AI) enabled technologies.

#
<img src="./img/original/Brand_Platform.png" align="right"
     alt="Mission Vision Icons" width="320" >

### Vision

Fundamentally changing the way in which the DoD navigates its universe of requirements and makes decisions

### Mission
GAMECHANGER aspires to be the Department’s trusted solution for evidence-based, data-driven decision-making across the universe of DoD requirements by:

- Building the DoD’s authoritative corpus of requirements and policy to drive search, discovery, understanding, and analytic capabilities
- Operationalizing cutting-edge technologies, algorithms, models and interfaces to automate and scale the solution
- Fusing best practices from industry, academia, and government to advance innovation and research
- Engaging the open-source community to build generalizable and replicable technology

## License & Contributions
See LICENSE.md (including licensing intent - INTENT.md) and CONTRIBUTING.md

## How to Setup Local Env for Development

These are the recommended steps if you are just trying to get coding.

- Ensure you have docker and docker-compose installed on your machine
- Pull down the code
- In gamechanger-web/backend, copy .env.template to .env and fill in the values to point to your databases appropriately
- In gamechanger-web/frontend, copy .env.template to .env.development and fill in the values to point to your URLs appropriately
- In gamechanger-web/backend _and_ frontend, copy .npmrc.template to .npmrc and edit the files to contain a valid GitHub Personal Access Token with "read:packages" permissions (you can generate a new token by visiting https://github.com/settings/tokens)
- **Side note** - If you have access to GAMECHANGER's DI2E Confluence space, you can grab our pre-canned versions of the above files from [here](https://confluence.di2e.net/display/UOT/GC+-+Development+Resources)
- At the top level run **./resetDocker.sh**
- Your frontend will be available at http://localhost:8080/#/gamechanger
- To access the frontend, you should set up the modheader extension for chrome and set your request headers to include the key **x-env-ssl_client_certificate** with a value of CN=007

## How to Setup Local Single Node K8s Env for Development/Testing

This set up is more advanced and is intended for prepping for releases to production environments.

- Ensure you have docker, docker-compose, and kubernetes installed on your machine
- Pull down the code
- In gamechanger-web/k8s/gamechanger-chart, copy values.yaml to values.dev.yaml and fill in the values to point to your databases appropriately
- **Side note** - If you have access to GAMECHANGER's DI2E Confluence space, you can grab our pre-canned version of the above file from [here](https://confluence.di2e.net/display/UOT/GC+-+Development+Resources).
- At the top level run docker build -t 10.194.9.80:5000/gamechanger-web:latest -f Dockerfile.prod .
- At the top level run docker push 10.194.9.80:5000/gamechanger-web:latest
- In gamechanger-web/k8s, run **kubectl apply -f .**
- In gamechanger-web/k8s, run **./deploy.sh**
- Run **kubectl get pods** and once all pods are in a successful state the application should be up and available. Note the gamechanger-web pod name for the next step.
- Run **kubectl port-forward <INSERT_GAMECHANGER-WEB_POD_NAME_HERE> 8990:8990**
- Your frontend will be available at http://localhost:8990/#/gamechanger
- To access the frontend, you should set up the modheader extension for chrome and set your request headers to include the key **x-env-ssl_client_certificate** with a value of CN=007
- If you need to troubleshoot postgres, this command will start up a pod with postgres access: **kubectl run -i --tty mypod --image=postgres:9.6 -- /bin/bash**
- Once in that container you can run **psql -U postgres -h postgres** to inspect the database

## Known/Common Issues

- Currently this repo assumes you are working with some external dependencies in our corporate environment. We are currently working to remove this limitation. Stay tuned, this update will come soon. Once this gets solved we will also include a pre-canned .env and .env.development that can work out of the box.
