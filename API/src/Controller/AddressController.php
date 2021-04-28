<?php

namespace App\Controller;

use App\Repository\AddressRepository;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
     * @Route("/suggestAddress/{address}/{cp}", defaults={"cp": null}, name="suggestAddress", methods={"GET"})
     */
    public function suggestAddress($address, $cp): JsonResponse
    {
        $data = $this->addressRepository->suggestAddress($address, $cp);

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
                if (!empty($cp)) {
                    $address = $this->addressRepository->findBy(['cp' => $cp]);
                } else {
                    $address = $this->addressRepository->findAll();
                }

                $data = [];
                foreach ($address as $value) {
                    $data[] = [
                        'cp' => $value->getCp(),
                        'provincia' => strtoupper(substr($value->getProvincia(), 0, 1)) . strtolower(substr($value->getProvincia(), 1)),
                        'municipio' => strtoupper(substr($value->getMunicipio(), 0, 1)) . strtolower(substr($value->getMunicipio(), 1)),
                        'tipovia' => strtoupper(substr($value->getTipovia(), 0, 1)) . strtolower(substr($value->getTipovia(), 1)),
                        'calle' => strtoupper(substr($value->getCalle(), 0, 1)) . strtolower(substr($value->getcalle(), 1)),
                    ];
                }

                return new JsonResponse($data, Response::HTTP_OK);
            }
            return  new JsonResponse([], Response::HTTP_FORBIDDEN);
        }
        return new JsonResponse([], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/getProvinces/{cp}", defaults={"cp": null}, name="getProvinces", methods={"GET"})
     */
    public function getProvinces($cp): JsonResponse
    {
        $data = $this->addressRepository->getProvinces($cp);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getCp/{province}/{township}/{typeRoad}/{street}/{number}", defaults={"province": null, "township": null, "typeRoad": null, "street": null, "number": null}, name="getCp", methods={"GET"})
     */
    public function getCp($province, $township, $typeRoad, $street, $number): JsonResponse
    {
        $data = $this->addressRepository->getCp($province, $township, $typeRoad, $street, $number);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getTownship/{province}/{cp}", defaults={"cp": null}, name="getTownship", methods={"GET"})
     */
    public function getTownship($province, $cp): JsonResponse
    {
        $data = $this->addressRepository->getTownship($province, $cp);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getTypeRoad/{province}/{township}/{street}/{cp}", defaults={"cp": null, "street": null}, name="getTypeRoad", methods={"GET"})
     */
    public function getTypeRoad($province, $township, $street, $cp): JsonResponse
    {
        if ($street === ' ' || $street === '') $street = null;
        $data = $this->addressRepository->getTypeRoad($province, $township, $street, $cp);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getStreet/{province}/{township}/{typeRoad}/{cp}", defaults={"cp": null , "typeRoad": null}, name="getStreet", methods={"GET"})
     */
    public function getStreet($province, $township, $typeRoad, $cp): JsonResponse
    {
        if ($typeRoad === ' ' || $typeRoad === '') $typeRoad = null;
        $data = $this->addressRepository->getStreet($province, $township, $typeRoad, $cp);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/getNumber/{province}/{township}/{typeRoad}/{street}/{cp}", defaults={"cp": null}, name="getNumber", methods={"GET"})
     */
    public function getNumber($province, $township, $typeRoad, $street, $cp): JsonResponse
    {
        $data = $this->addressRepository->getNumber($province, $township, $typeRoad, $street, $cp);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/findProducts/{typeRoad}/{street}/{township}/{province}/{number}/{cp}", name="findProducts", methods={"GET"})
     */
    public function findProducts($typeRoad, $street, $township, $province, $number, $cp): JsonResponse
    {
        $data = [];
        $products = $this->addressRepository->findOneBy(['tipovia' => $typeRoad, 'calle' => $street, 'municipio' => $township, 'provincia' => $province, 'numero' => $number, 'cp' => $cp]);
        if (!empty($products)) {
            $data[] = $products->getProducto();
        }

        return new JsonResponse($data, Response::HTTP_OK);
    }
}
