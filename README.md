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

- Ensure you have docker and docker-compose installed on your machine
- Pull down the code
- In backend, copy .env.template to .env and fill in the values to point to your databases appropriately
- In backend, create a secrets folder at the top level of backend (gamechanger-web/backend/secrets) and drop in cert.pem, dod_certs.pem, gamechanger.crt, and key.pem
- In frontend, copy .env.template to .env.development and fill in the values to point to your URLs appropriately
- **Side note** - If you have access to GAMECHANGER's DI2E Confluence space, you can grab our pre-canned versions of the above files from [here](https://confluence.di2e.net/display/UOT/GC+-+Development+Resources)
- At the top level run **docker-compose build** to build the images
- At the top level run **docker-compose up** to start the containers

## Known/Common Issues

- Currently this repo assumes you are working with some external dependencies in our corporate environment. We are currently working to remove this limitation. Stay tuned, this update will come soon. Once this gets solved we will also include a pre-canned .env and .env.development that can work out of the box.
