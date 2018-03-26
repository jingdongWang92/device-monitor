#!/bin/bash

echo ${DOCKER_REGISTRY_PASSWORD} | docker login --username ${DOCKER_REGISTRY_USERNAME} --password-stdin ${DOCKER_REGISTRY}

export DOCKER_IMAGE_NAME=${CI_PROJECT_NAMESPACE}-${CI_PROJECT_NAME}
export DOCKER_REPO=${DOCKER_REGISTRY}/${DOCKER_REGISTRY_NAMESPACE}/${DOCKER_IMAGE_NAME}

docker build --pull -f Dockerfile -t ${DOCKER_REPO}:${CI_COMMIT_SHA} .

if [ "${CI_COMMIT_REF_SLUG}" == "master" ]
then
  docker tag ${DOCKER_REPO}:${CI_COMMIT_SHA} ${DOCKER_REPO}:latest
else
  docker tag ${DOCKER_REPO}:${CI_COMMIT_SHA} ${DOCKER_REPO}:${CI_COMMIT_REF_SLUG}
fi

if [ "${CI_COMMIT_TAG}" != "" ]
then
  docker tag ${DOCKER_REPO}:${CI_COMMIT_SHA} ${DOCKER_REPO}:${CI_COMMIT_TAG}
fi

docker push ${DOCKER_REPO}
