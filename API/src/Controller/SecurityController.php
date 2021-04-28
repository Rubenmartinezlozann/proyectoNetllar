<?php

namespace App\Controller;

use App\Entity\Token;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\TokenRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends AbstractController
{
    private $userRepository;
    private $tokenRepository;

    public function __construct(UserRepository $userRepository, TokenRepository $tokenRepository)
    {
        $this->userRepository = $userRepository;
        $this->tokenRepository = $tokenRepository;
    }

    /**
     * @Route("/login", name="login", methods={"POST"})
     */
    public function login(Request $request)
    {
        $user = $this->getUser();
        $token = $this->userRepository->login($user);
        return $this->json([
            'token' => $token->getToken(),
            'exp_date' => $token->getExpiationDate()
        ]);
    }

    /**
     * @Route("/logout", name="logout", methods={"POST"})
     */
    public function logout(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data['username'])) {
            $user = $this->userRepository->findOneBy(['username' => $data['username']]);
        } else {
            $user = $this->tokenRepository->findOneBy(['token' => $data['token']])->getUser();
        }

        if (!empty($user)) $this->userRepository->logout($user);
        return $this->json([
            'loged-out' => true
        ]);
    }

    /**
     * @Route("/testLogin", name="testLogin", methods={"POST"})
     */
    public function testLogin(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data['username'])) {
            $user = $this->userRepository->findOneBy(['username' => $data['username']]);
        } else {
            $user = $this->tokenRepository->findOneBy(['token' => $data['token']])->getUser();
        }

        return $this->json([
            'ok' => !empty($user) ? $this->userRepository->loginOk($user) : false,
            'token' => $user->getToken(),
            'role' => $user->getRoles()
        ]);
    }
}
