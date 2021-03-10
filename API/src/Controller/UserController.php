<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserController extends AbstractController
{
    /**
     * @Route("/addUser", name="addUser", methods={"POST"})
     */
    public function addUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username'];

        if ($this->userRepository->usernameEmpty($username)) {
            $password = $data['password'];
            $city = $data['city'];
            $phoneContact = $data['phone_contact'];
            $mail = $data['mail'];
            $address = $data['address'];

            if (empty($username) || empty($password) || empty($city) || empty($phoneContact) || empty($mail) || empty($address)) {
                throw new NotFoundHttpException('Expecting mandatory parameters!');
            }

            $this->userRepository->saveUser($username, $password, ['ROLE_USER'], $city, $phoneContact, $mail, $address);
            return new JsonResponse(true, Response::HTTP_CREATED);
        }
        return new JsonResponse(false, Response::HTTP_BAD_REQUEST);
    }

    /**
     * @Route("/getUser/{idUser}", name="getUser", methods={"GET"})
     */
    public function getUsr($idUser): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['id' => $idUser]);

        $data = [
            'username' => $user->getUsername(),
            'password' => $user->getPassword(),
            'role' => $user->getRoles(),
            'city' => $user->getCity(),
            'phone_contact' => $user->getPhoneContact(),
            'mail' => $user->getMail(),
            'address' => $user->getAddress(),
        ];

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/updateUser", name="updateUser", methods={"PUT"})
     */
    public function editUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $this->userRepository->findOneBy(['username' => $data['username']]);

        empty($data['username']) ? true : $user->setUsername($data['username']);
        empty($data['password']) ? true : $user->setPassword($data['password']);
        empty($data['city']) ? true : $user->setCity($data['city']);
        empty($data['phone_contact']) ? true : $user->setPhoneContact($data['phone_contact']);
        empty($data['mail']) ? true : $user->setMail($data['mail']);
        empty($data['address']) ? true : $user->setMainLanguage($data['address']);
        $user->setRoles(['ROLE_USER']);

        $updatedUser = $this->userRepository->updateUser($user);

        return new JsonResponse(['status' => 'User updated!'], Response::HTTP_OK);
    }

    /**
     * @Route("/deleteUser/{idUser}", name="deleteUser", methods={"DELETE"})
     */
    public function deleteUser($idUser): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['id' => $idUser]);

        $this->userRepository->removeUser($user);

        return new JsonResponse(['status' => 'user deleted!'], Response::HTTP_OK);
    }
}
