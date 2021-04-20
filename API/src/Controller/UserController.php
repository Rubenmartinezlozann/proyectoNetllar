<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\TokenRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserController extends AbstractController
{
    public function __construct(UserRepository $userRepository, TokenRepository $tokenRepository)
    {
        $this->userRepository = $userRepository;
        $this->tokenRepository = $tokenRepository;
    }

    /**
     * @Route("/addUser", name="addUser", methods={"POST"})
     */
    public function addUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $username = $data['username'];

        if (empty($this->userRepository->findOneBy(['username' => $username]))) {
            $password = $data['password'];
            // $city = $data['city'];
            // $phoneContact = $data['phone_contact'];
            // $mail = $data['mail'];
            // $address = $data['address'];

            if (empty($username) || empty($password) /* || empty($city) || empty($phoneContact) || empty($mail) || empty($address) */) {
                throw new NotFoundHttpException('Expecting mandatory parameters!');
            }

            $this->userRepository->saveUser($username, $password, ['ROLE_USER'], '', 123456789, '', ''/* , $city, $phoneContact, $mail, $address */);
            return new JsonResponse(['created' => true], Response::HTTP_CREATED);
        }
        return new JsonResponse(['created' => false], Response::HTTP_OK);
    }

    /**
     * @Route("/getUsers", name="getUsers", methods={"GET"})
     */
    public function getUsers(): JsonResponse
    {
        $users = $this->userRepository->findAll();

        $data = [];
        foreach ($users as $user) {
            $data[] = [
                'username' => $user->getUsername(),
                // 'password' => $user->getPassword(),
                // 'role' => $user->getRoles(),
            ];
        }

        return new JsonResponse($data, Response::HTTP_OK);
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
     * @Route("/getUserByUsername/{username}", name="getUserByUsername", methods={"GET"})
     */
    public function getUserByUsername($username): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['username' => $username]);
        if (!empty($user)) {
            $data[] = [
                'username' => $user->getUsername(),
                'password' => $user->getPassword(),
            ];
        } else {
            $data = null;
        }

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getUserByToken/{token}", name="getUserByToken", methods={"GET"})
     */
    public function getUserByToken($token): JsonResponse
    {
        $token = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($token)) {
            $data = [
                'role' => $token->getUser()->getRoles(),
            ];
        } else {
            $data = ['role' => null];
        }

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
        // empty($data['city']) ? true : $user->setCity($data['city']);
        // empty($data['phone_contact']) ? true : $user->setPhoneContact($data['phone_contact']);
        // empty($data['mail']) ? true : $user->setMail($data['mail']);
        // empty($data['address']) ? true : $user->setAddress($data['address']);
        // $user->setRoles(['ROLE_USER']);

        $updatedUser = $this->userRepository->updateUser($user);

        return new JsonResponse(['updated' => $updatedUser], Response::HTTP_OK);
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

    /**
     * @Route("/deleteUserByUsername/{username}", name="deleteUserByUsername", methods={"DELETE"})
     */
    public function deleteUserByUsername($username): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['username' => $username]);

        if (!empty($user)) {
            $this->userRepository->removeUser($user);
            return new JsonResponse(['deleted' => true], Response::HTTP_OK);
        } else {
            return new JsonResponse(['deleted' => false], Response::HTTP_OK);
        }
    }
}
