<?php

namespace App\Controller;

use App\Entity\User;
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
    private $tokenRepository;
    private $userRepository;
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
        $u = $this->tokenRepository->findOneBy(['token' => $data['token']]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u) && $u->getRoles()[0] === 'ROLE_ADMIN') {
                $username = $data['username'];

                if (empty($this->userRepository->findOneBy(['username' => $username]))) {
                    $password = $data['password'];

                    if (empty($username) || empty($password)) {
                        throw new NotFoundHttpException('Expecting mandatory parameters!');
                    }

                    $this->userRepository->saveUser($username, $password, ['ROLE_USER'], '', 123456789, '', '');
                    return new JsonResponse(['created' => true], Response::HTTP_CREATED);
                }
                return new JsonResponse(['created' => false], Response::HTTP_OK);
            }
            return new JsonResponse(['created' => false], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse(['created' => false], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getUsers/{token}", name="getUsers", methods={"GET"})
     */
    public function getUsers($token): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u) && $u->getRoles()[0] === 'ROLE_ADMIN') {

                $users = $this->userRepository->findAll();

                $data = [];
                foreach ($users as $user) {
                    $data[] = [
                        'username' => $user->getUsername(),
                        'role' => $user->getRoles(),
                    ];
                }

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getUser/{idUser}", name="getUser", methods={"GET"})
     */
    // public function getUsr($idUser): JsonResponse
    // {
    //     $user = $this->userRepository->findOneBy(['id' => $idUser]);

    //     $data = [
    //         'username' => $user->getUsername(),
    //         'password' => $user->getPassword(),
    //         'role' => $user->getRoles(),
    //         'city' => $user->getCity(),
    //         'phone_contact' => $user->getPhoneContact(),
    //         'mail' => $user->getMail(),
    //         'address' => $user->getAddress(),
    //     ];

    //     return new JsonResponse($data, Response::HTTP_OK);
    // }

    /**
     * @Route("/getUserByUsername/{username}", name="getUserByUsername", methods={"GET"})
     */
    // public function getUserByUsername($username): JsonResponse
    // {
    //     $user = $this->userRepository->findOneBy(['username' => $username]);
    //     if (!empty($user)) {
    //         $data[] = [
    //             'id' => $user->getId(),
    //             'username' => $user->getUsername(),
    //             'password' => $user->getPassword(),
    //         ];
    //     } else {
    //         $data = null;
    //     }

    //     return new JsonResponse($data, Response::HTTP_OK);
    // }

    /**
     * @Route("/getUserByToken/{token}", name="getUserByToken", methods={"GET"})
     */
    // public function getUserByToken($token): JsonResponse
    // {
    //     $token = $this->tokenRepository->findOneBy(['token' => $token]);
    //     if (!empty($token)) {
    //         $data = [
    //             'role' => $token->getUser()->getRoles(),
    //         ];
    //     } else {
    //         $data = ['role' => null];
    //     }

    //     return new JsonResponse($data, Response::HTTP_OK);
    // }

    /**
     * @Route("/updateUser", name="updateUser", methods={"PUT"})
     */
    public function updateUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $u = $this->tokenRepository->findOneBy(['token' => $data['token']]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u) && $u->getRoles()[0] === 'ROLE_ADMIN') {
                $user = $this->userRepository->findOneBy(['id' => $data['id']]);

                if (!empty($user)) {
                    if (!empty($data['username']) && $data['username'] !== $user->getUsername() && empty($this->userRepository->findOneBy(['username' => $data['username']]))) $user->setUsername($data['username']);
                    if (!empty($data['password'])) $user->setPassword($data['password']);

                    $updatedUser = $this->userRepository->updateUser($user);

                    return new JsonResponse(['updated' => $updatedUser], Response::HTTP_OK);
                } else {
                    return new JsonResponse(['updated' => false], Response::HTTP_OK);
                }
            }
            return new JsonResponse(['updated' => false], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse(['updated' => false], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/updateUserByUsername", name="updateUserByUsername", methods={"PUT"})
     */
    // public function updateUserByUsername(Request $request): JsonResponse
    // {
    // $data = json_decode($request->getContent(), true);
    // if (empty($this->userRepository->findOneBy(['username' => $data['username']]))) {
    //     $user = $this->userRepository->findOneBy(['id' => $data['id']]);

    //     empty($data['username']) ? true : $user->setUsername($data['username']);
    //     empty($data['password']) ? true : $user->setPassword($data['password']);
    //     // empty($data['city']) ? true : $user->setCity($data['city']);
    //     // empty($data['phone_contact']) ? true : $user->setPhoneContact($data['phone_contact']);
    //     // empty($data['mail']) ? true : $user->setMail($data['mail']);
    //     // empty($data['address']) ? true : $user->setAddress($data['address']);
    //     // $user->setRoles(['ROLE_USER']);

    //     $updatedUser = $this->userRepository->updateUser($user);

    //     return new JsonResponse(['updated' => $updatedUser], Response::HTTP_OK);
    // } else {
    //     return new JsonResponse(['updated' => false], Response::HTTP_OK);
    // }
    // }

    /**
     * @Route("/deleteUser/{idUser}/{token}", name="deleteUser", methods={"DELETE"})
     */
    public function deleteUser($idUser, $token): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u) && $u->getRoles()[0] === 'ROLE_ADMIN') {
                $user = $this->userRepository->findOneBy(['id' => $idUser]);

                $this->userRepository->removeUser($user);

                return new JsonResponse(['deleted' => true], Response::HTTP_OK);
            }
            return new JsonResponse(['deleted' => false], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse(['deleted' => false], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/deleteUserByUsername/{username}", name="deleteUserByUsername", methods={"DELETE"})
     */
    // public function deleteUserByUsername($username): JsonResponse
    // {
    //     $user = $this->userRepository->findOneBy(['username' => $username]);

    //     if (!empty($user)) {
    //         $this->userRepository->removeUser($user);
    //         return new JsonResponse(['deleted' => true], Response::HTTP_OK);
    //     } else {
    //         return new JsonResponse(['deleted' => false], Response::HTTP_OK);
    //     }
    // }
}
