<?php

namespace App\Controller;

use App\Repository\AddressRepository;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Console\Event\ConsoleEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AddressController extends AbstractController
{
    private $addressRepository;

    public function __construct(AddressRepository $addressRepository, TokenRepository $tokenRepository, UserRepository $userRepository)
    {
        $this->addressRepository = $addressRepository;
        $this->tokenRepository = $tokenRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * @Route("/getOneAddressByText/{address}/{number}/{cp}", name="getOneAddressByText", methods={"GET"})
     */
    public function getOneAddressByText($address, $number, $cp): JsonResponse
    {
        $data = $this->addressRepository->getOneAddressByText($address, $number, $cp);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getAllAddress/{token}/{cp}", defaults={"cp": null}, name="getAllAddress", methods={"GET"})
     */
    public function getAllAddress($token, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                $data = $this->addressRepository->getAllAddress($cp);
                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getProvinces/{token}/{cp}", defaults={"cp": null}, name="getProvinces", methods={"GET"})
     */
    public function getProvinces($token, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                $data = $this->addressRepository->getProvinces($cp);

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getCp/{token}/{province}/{township}/{typeRoad}/{street}/{number}", defaults={"province": null, "township": null, "typeRoad": null, "street": null, "number": null}, name="getCp", methods={"GET"})
     */
    public function getCp($token, $province, $township, $typeRoad, $street, $number): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                $data = $this->addressRepository->getCp($province, $township, $typeRoad, $street, $number);

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getTownship/{token}/{province}/{cp}", defaults={"cp": null}, name="getTownship", methods={"GET"})
     */
    public function getTownship($token, $province, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                $data = $this->addressRepository->getTownship($province, $cp);

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getTypeRoad/{token}/{province}/{township}/{street}/{cp}", defaults={"cp": null, "street": null}, name="getTypeRoad", methods={"GET"})
     */
    public function getTypeRoad($token, $province, $township, $street, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                if ($street === ' ' || $street === '') $street = null;
                $data = $this->addressRepository->getTypeRoad($province, $township, $street, $cp);

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getStreet/{token}/{province}/{township}/{typeRoad}/{cp}", defaults={"cp": null , "typeRoad": null}, name="getStreet", methods={"GET"})
     */
    public function getStreet($token, $province, $township, $typeRoad, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                if ($typeRoad === ' ' || $typeRoad === '') $typeRoad = null;
                $data = $this->addressRepository->getStreet($province, $township, $typeRoad, $cp);

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getNumber/{token}/{province}/{township}/{typeRoad}/{street}/{cp}", defaults={"cp": null}, name="getNumber", methods={"GET"})
     */
    public function getNumber($token, $province, $township, $typeRoad, $street, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                $data = $this->addressRepository->getNumber($province, $township, $typeRoad, $street, $cp);

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/findProducts/{token}/{typeRoad}/{street}/{township}/{province}/{number}/{cp}", name="findProducts", methods={"GET"})
     */
    public function findProducts($token, $typeRoad, $street, $township, $province, $number, $cp): JsonResponse
    {
        $u = $this->tokenRepository->findOneBy(['token' => $token]);
        if (!empty($u)) {
            $u = $u->getUser();
            if ($this->userRepository->loginOk($u)) {
                $data = [];
                $products = $this->addressRepository->findOneBy(['tipovia' => $typeRoad, 'calle' => $street, 'municipio' => $township, 'provincia' => $province, 'numero' => $number, 'cp' => $cp]);
                if (!empty($products)) {
                    $data[] = $products->getProducto();
                }

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }
}
